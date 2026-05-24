<?php

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;
use Dotenv\Dotenv;

// Load environment variables
if (file_exists(__DIR__ . '/.env')) {
    $dotenv = Dotenv::createImmutable(__DIR__);
    $dotenv->load();
}

$capsule = new Capsule();

// Add the master database connection
$capsule->addConnection([
    'driver'    => 'mysql',
    'host'      => $_ENV['DB_HOST'] ?? '127.0.0.1',
    'port'      => $_ENV['DB_PORT'] ?? '3306',
    'database'  => $_ENV['DB_DATABASE'] ?? 'inovalotomasterdb',
    'username'  => $_ENV['DB_USERNAME'] ?? 'root',
    'password'  => $_ENV['DB_PASSWORD'] ?? '',
    'charset'   => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix'    => '',
    'options'   => [
        \PDO::ATTR_TIMEOUT => 30,
    ]
], 'master');

// Set the default connection to master
$capsule->getDatabaseManager()->setDefaultConnection('master');

// Make this Capsule instance available globally
$capsule->setAsGlobal();

// Setup the Eloquent ORM
$capsule->bootEloquent();

/**
 * Helper class for registering tenant database connections dynamically.
 */
class DbConfig
{
    /**
     * Register a connection name to a specific database name if not already registered.
     */
    public static function registerTenantConnection(string $connectionName, string $dbName): void
    {
        $prefixMap = [
            'imperiosorte' => 'IMPERIO_SORTE',
            'inovaloto' => 'INOVA_LOTO',
            'bancaforte' => 'BANCA_FORTE',
        ];
        
        $prefix = $prefixMap[strtolower($dbName)] ?? strtoupper(str_replace('-', '_', $dbName));
        
        $driver = $_ENV["{$prefix}_DB_CONNECTION"] ?? 'mysql';
        $host = $_ENV["{$prefix}_DB_HOST"] ?? ($_ENV['DB_HOST'] ?? '127.0.0.1');
        $port = $_ENV["{$prefix}_DB_PORT"] ?? ($_ENV['DB_PORT'] ?? '3306');
        $database = $_ENV["{$prefix}_DB_DATABASE"] ?? $dbName;
        $username = $_ENV["{$prefix}_DB_USERNAME"] ?? ($_ENV['DB_USERNAME'] ?? 'root');
        $password = $_ENV["{$prefix}_DB_PASSWORD"] ?? ($_ENV['DB_PASSWORD'] ?? '');

        Capsule::addConnection([
            'driver'    => $driver,
            'host'      => $host,
            'port'      => $port,
            'database'  => $database,
            'username'  => $username,
            'password'  => $password,
            'charset'   => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix'    => '',
            'options'   => [
                \PDO::ATTR_TIMEOUT => 30,
            ]
        ], $connectionName);
    }
}
