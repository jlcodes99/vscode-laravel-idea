<?php

// Laravel Router Navigator 插件测试文件
// Author: 李杰
// Date: 2025/01/18

use Illuminate\Support\Facades\Route;

// 测试用例1：API路由格式
$api->get('users', 'UserController@index');
$api->post('users', 'UserController@store');
$api->put('users/{id}', 'UserController@update');
$api->delete('users/{id}', 'UserController@destroy');

// 测试用例2：标准路由格式
Route::get('products', 'ProductController@index');
Route::post('products', 'ProductController@store');

// 测试用例3：嵌套路由
$api->group(['namespace' => 'Staff', 'prefix' => 'staff'], function ($api) {
    $api->get('notifications', 'StaffNotificationsController@getNotify');
    $api->post('notifications/read', 'StaffNotificationsController@markAsRead');
});

// 测试用例4：不同引号格式
$api->get("orders", "OrderController@index");
$api->post(`orders`, `OrderController@store`);

// 测试用例5：复杂控制器名称
$api->get('merchant/sales', 'MerchantSalesChannelController@index');
$api->post('expert/online', 'ExpertsOnlineController@create');