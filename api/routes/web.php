<?php

// Routes that do not require authentication
$router->post('users/register', 'UserController@register');
$router->post('users/login', 'UserController@login');
$router->post('users/password/forgot', 'UserController@forgotPassword');
$router->put('users/password', 'UserController@updatePassword');
$router->post('emails/verify/{verification_code}', 'EmailController@verify');

// Routes that require authentication
$router->group(['middleware' => 'auth'], function ($router) {

});