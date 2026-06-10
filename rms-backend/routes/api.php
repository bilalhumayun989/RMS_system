<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\KitchenOrderController;
use App\Http\Controllers\MenuItemController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\RestaurantTableController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::apiResource('menu-items', MenuItemController::class);
Route::apiResource('employees', EmployeeController::class);
Route::apiResource('tables', RestaurantTableController::class);
Route::apiResource('orders', OrderController::class);
Route::apiResource('kitchen-orders', KitchenOrderController::class)->only(['index', 'show', 'update', 'destroy']);
