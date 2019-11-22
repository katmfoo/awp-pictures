<?php

/*
 * file - api/bootstrap/app.php
 * author - Patrick Richeal
 * 
 * Main file that starts up the api
 */

// Include stuff from composer (php package manager)
require_once __DIR__.'/../vendor/autoload.php';

// Setup lumen (php api framework)
(new Laravel\Lumen\Bootstrap\LoadEnvironmentVariables(dirname(__DIR__)))->bootstrap();
$app = new Laravel\Lumen\Application(dirname(__DIR__));
$app->withFacades();
$app->withEloquent();

// Register cors middleware to response properly to cors options requests
$app->middleware([App\Http\Middleware\Cors::class]);

// Register auth middleware that we can attach to routes (defined in
// api/app/Http/Middleware/Authenticate.php)
$app->routeMiddleware(['auth' => App\Http\Middleware\Authenticate::class]);

// Register auth service provider (defined in api/app/Providers/AuthServiceProvider.php)
$app->register(App\Providers\AuthServiceProvider::class);

// Register routes from route file (defined in api/routes/web.php)
$app->router->group([
    'namespace' => 'App\Http\Controllers',
], function ($router) {
    require __DIR__.'/../routes/web.php';
});

return $app;
