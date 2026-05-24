<?php

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

// Load environment variables from parent folder or local folder
$envPath = file_exists(__DIR__ . '/.env') ? __DIR__ : __DIR__ . '/..';
if (file_exists($envPath . '/.env')) {
    $lines = file($envPath . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (str_starts_with(trim($line), '#')) continue;
        [$name, $value] = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
        $_SERVER[trim($name)] = trim($value);
    }
}

// Instantiate Eloquent Capsule Manager
$capsule = new Capsule;

// Configure Master database connection
$capsule->addConnection([
    'driver'    => $_ENV['DB_DRIVER'] ?? 'mysql',
    'host'      => $_ENV['DB_HOST'] ?? '127.0.0.1',
    'database'  => $_ENV['DB_DATABASE_MASTER'] ?? 'inovaloto_master',
    'username'  => $_ENV['DB_USERNAME_MASTER'] ?? 'root',
    'password'  => $_ENV['DB_PASSWORD_MASTER'] ?? '',
    'charset'   => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix'    => '',
], 'master');

// Set master connection as default for global operations
$capsule->getDatabaseManager()->setDefaultConnection('master');

// Set Capsule global static access
$capsule->setAsGlobal();
$capsule->bootEloquent();

// Helper class to register tenant databases dynamically in Capsule
class DbConfig {
    public static function registerTenantConnection(string $connectionName, string $databaseName): void
    {
        $manager = Capsule::getDatabaseManager();
        
        // Return if connection is already registered
        try {
            if ($manager->connection($connectionName)) {
                return;
            }
        } catch (\InvalidArgumentException $e) {
            // Connection is not defined, proceed to register
        }

        $prefixMap = [
            'imperiosorte' => 'IMPERIO_SORTE',
            'inovaloto' => 'INOVA_LOTO',
            'bancaforte' => 'BANCA_FORTE',
        ];
        
        $prefix = $prefixMap[strtolower($databaseName)] ?? strtoupper(str_replace('-', '_', $databaseName));
        
        $driver = $_ENV["{$prefix}_DB_CONNECTION"] ?? ($_ENV['DB_DRIVER'] ?? 'mysql');
        $host = $_ENV["{$prefix}_DB_HOST"] ?? ($_ENV['DB_HOST'] ?? '127.0.0.1');
        $port = $_ENV["{$prefix}_DB_PORT"] ?? ($_ENV['DB_PORT'] ?? '3306');
        $database = $_ENV["{$prefix}_DB_DATABASE"] ?? $databaseName;
        $username = $_ENV["{$prefix}_DB_USERNAME"] ?? ($_ENV['DB_USERNAME'] ?? 'root');
        $password = $_ENV["{$prefix}_DB_PASSWORD"] ?? ($_ENV['DB_PASSWORD'] ?? '');

        $manager->addConnection([
            'driver'    => $driver,
            'host'      => $host,
            'port'      => $port,
            'database'  => $database,
            'username'  => $username,
            'password'  => $password,
            'charset'   => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix'    => '',
        ], $connectionName);
    }
}
