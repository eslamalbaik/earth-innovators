<?php

namespace Tests\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Redis\RedisManager;
use Illuminate\Contracts\Redis\Factory;

class TestServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Prevent Redis connection in tests when using array cache
        if (env('APP_ENV') === 'testing' && env('CACHE_STORE') === 'array') {
            // Override Redis manager to prevent connection attempts
            $this->app->singleton('redis', function ($app) {
                $config = $app->make('config')->get('database.redis', []);
                $driver = $config['client'] ?? 'phpredis';
                
                // Create a RedisManager that implements Factory interface
                return new class($app, $driver, $config) extends RedisManager implements Factory {
                    public function __construct($app, $driver, $config) {
                        // Don't call parent constructor to avoid connection
                        $this->app = $app;
                        $this->driver = $driver;
                        $this->config = $config;
                        $this->connections = [];
                    }
                    
                    public function connection($name = null) {
                        $name = $name ?: 'default';
                        
                        if (isset($this->connections[$name])) {
                            return $this->connections[$name];
                        }
                        
                        // Return a fake connection that doesn't try to connect
                        return $this->connections[$name] = new class {
                            public function __call($method, $parameters) {
                                // Return appropriate values for common Redis operations
                                if (in_array($method, ['get', 'hget', 'hgetall', 'lrange', 'smembers', 'zrange', 'zrevrange'])) {
                                    return null;
                                }
                                if (in_array($method, ['set', 'hset', 'lpush', 'rpush', 'sadd', 'del', 'hdel', 'zadd'])) {
                                    return true;
                                }
                                if (in_array($method, ['exists', 'hexists', 'sismember', 'zscore'])) {
                                    return false;
                                }
                                if (in_array($method, ['flushdb', 'flushall'])) {
                                    return true;
                                }
                                if ($method === 'pipeline' || $method === 'transaction') {
                                    return [];
                                }
                                return null;
                            }
                        };
                    }
                };
            });
        }
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}

