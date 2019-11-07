<?php

// Routes that do not require authentication
$router->post('users/register', 'UserController@register');
$router->post('users/login', 'UserController@login');

// Routes that require authentication
$router->group(['middleware' => 'auth'], function ($router) {

    $router->get('/', function ()  {
        return 'root';
    });

});