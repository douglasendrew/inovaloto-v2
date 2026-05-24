<?php

require_once __DIR__ . '/bootstrap.php';

use App\Models\Master\Banca;
use Aws\S3\S3Client;
use Carbon\Carbon;
use Swoole\Coroutine;
use Swoole\Timer;

// Run once support
$runOnce = in_array('--once', $argv) || in_array('-o', $argv);

function runBackup()
{
    echo "[" . date('Y-m-d H:i:s') . "] Starting database backup routine...\n";

    // Define local backup path
    $backupPath = __DIR__ . '/backups/' . date('Y-m-d');
    if (!file_exists($backupPath)) {
        mkdir($backupPath, 0755, true);
    }

    // 1. Backup Master Database
    $masterConfig = [
        'host' => $_ENV['DB_HOST'] ?? '127.0.0.1',
        'database' => $_ENV['DB_DATABASE_MASTER'] ?? 'inovaloto_master',
        'username' => $_ENV['DB_USERNAME_MASTER'] ?? 'root',
        'password' => $_ENV['DB_PASSWORD_MASTER'] ?? '',
    ];
    backupDatabase('master', $backupPath, $masterConfig);

    // 2. Backup Tenant Databases
    $bancas = Banca::where('status', 'active')->get();
    foreach ($bancas as $banca) {
        echo "--------------------------------------------------\n";
        echo "Banca: {$banca->nome}\n";

        $tenantConfig = [
            'host' => $_ENV['DB_HOST'] ?? '127.0.0.1',
            'database' => $banca->db_name,
            'username' => $_ENV['DB_USERNAME'] ?? 'root',
            'password' => $_ENV['DB_PASSWORD'] ?? '',
        ];

        backupDatabase($banca->login_code, $backupPath, $tenantConfig);
    }

    echo "--------------------------------------------------\n";
    echo "[" . date('Y-m-d H:i:s') . "] Database backup routine finished.\n";
}

function backupDatabase(string $prefix, string $backupPath, array $config)
{
    $database = $config['database'];
    $username = $config['username'];
    $password = $config['password'];
    $host = $config['host'];

    echo "Processing database: {$database} (Host: {$host}, User: {$username})\n";

    $timestamp = date('Y-m-d_H-i-s');
    $fileName = $timestamp . '_' . $prefix . '.sql';
    $zipName = $timestamp . '_' . $prefix . '.zip';
    
    $filePath = $backupPath . DIRECTORY_SEPARATOR . $fileName;
    $zipPath = $backupPath . DIRECTORY_SEPARATOR . $zipName;

    $mysqldump = $_ENV['MYSQLDUMP_PATH'] ?? 'mysqldump';
    
    // Build mysqldump command line
    $dumpCommand = "\"{$mysqldump}\" -h {$host} -u {$username}";
    if (!empty($password)) {
        $dumpCommand .= " -p\"{$password}\"";
    }
    $dumpCommand .= " --no-tablespaces {$database} > \"{$filePath}\"";

    try {
        // Execute mysqldump
        exec($dumpCommand, $output, $returnVar);

        if ($returnVar !== 0) {
            echo "-> Error executing mysqldump for {$database}.\n";
            return;
        }

        echo "-> Backup SQL created: {$fileName}\n";

        // Compact SQL dump to ZIP
        $zip = new \ZipArchive();
        if ($zip->open($zipPath, \ZipArchive::CREATE) === true) {
            $zip->addFile($filePath, $fileName);
            $zip->close();
            
            // Delete original SQL dump to save space
            unlink($filePath);
            echo "-> Compressed to ZIP: {$zipName}\n";
        } else {
            echo "-> Failed to create ZIP file for {$database}.\n";
            return;
        }

        // Upload ZIP to Cloudflare R2
        uploadToR2($zipPath, $zipName);

    } catch (\Throwable $e) {
        echo "-> Exception generating backup for {$database}: " . $e->getMessage() . "\n";
    }
}

function uploadToR2(string $zipPath, string $zipName)
{
    $key = $_ENV['R2_ACCESS_KEY_ID'] ?? null;
    $secret = $_ENV['R2_SECRET_ACCESS_KEY'] ?? null;
    $bucket = $_ENV['R2_BUCKET'] ?? null;
    $endpoint = $_ENV['R2_ENDPOINT'] ?? null;
    $region = $_ENV['R2_REGION'] ?? 'auto';

    if (!$key || !$secret || !$bucket || !$endpoint) {
        echo "-> Cloudflare R2 not configured. Keeping ZIP file locally at: {$zipPath}\n";
        return;
    }

    try {
        $s3 = new S3Client([
            'region' => $region,
            'endpoint' => $endpoint,
            'credentials' => [
                'key' => $key,
                'secret' => $secret,
            ],
            'version' => 'latest',
            'use_path_style_endpoint' => isset($_ENV['R2_USE_PATH_STYLE_ENDPOINT']) ? (bool)$_ENV['R2_USE_PATH_STYLE_ENDPOINT'] : true,
        ]);

        $r2Path = date('Y-m-d') . '/' . $zipName;

        echo "-> Uploading to R2: {$r2Path}...\n";

        $s3->putObject([
            'Bucket' => $bucket,
            'Key' => $r2Path,
            'SourceFile' => $zipPath,
        ]);

        echo "-> Uploaded to Cloudflare R2 successfully.\n";

        // Delete local ZIP after upload success
        unlink($zipPath);
        echo "-> Local ZIP removed.\n";

    } catch (\Throwable $e) {
        echo "-> Cloudflare R2 Upload Error: " . $e->getMessage() . "\n";
    }
}

if ($runOnce) {
    \Swoole\Coroutine\run(function () {
        runBackup();
    });
} else {
    echo "Starting Persistent Backup Bancas Worker Daemon using Swoole...\n";

    // Run every 24 hours (24 * 60 * 60 * 1000 ms)
    $intervalMs = 24 * 60 * 60 * 1000;

    Timer::tick($intervalMs, function () {
        Coroutine::create(function () {
            runBackup();
        });
    });

    // Run first backup check immediately
    Coroutine::create(function () {
        runBackup();
    });
}
