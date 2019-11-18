<?php

// Routes that do not require authentication
$router->post('users/register', 'UserController@register');
$router->post('users/login', 'UserController@login');
$router->post('users/password/forgot', 'UserController@forgotPassword');
$router->put('users/password', 'UserController@updatePassword');
$router->post('users/verify-email', 'UserController@verifyEmail');

// Routes that require authentication
$router->group(['middleware' => 'auth'], function ($router) {

});