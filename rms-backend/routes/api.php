<?php

use App\Http\Controllers\AttendanceLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\KitchenOrderController;
use App\Http\Controllers\MenuItemController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\RestaurantTableController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SupplyController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('menu-items', MenuItemController::class);
    Route::apiResource('roles', RoleController::class)->middleware('can:viewAny,App\Models\Role');
    Route::apiResource('employees', EmployeeController::class)->middleware('can:viewAny,App\Models\Employee');
    Route::apiResource('tables', RestaurantTableController::class);
    Route::apiResource('orders', OrderController::class);
    Route::apiResource('kitchen-orders', KitchenOrderController::class)->only(['index', 'show', 'update', 'destroy']);
    Route::apiResource('customers', CustomerController::class)->except(['show']);
    Route::apiResource('attendance', AttendanceLogController::class)->except(['show']);
    Route::apiResource('expenses', ExpenseController::class)->except(['show']);

    // Supplies
    Route::apiResource('supplies', SupplyController::class)->except(['show']);
    Route::get('supplies/{supply}/logs', [SupplyController::class, 'logs']);
    Route::post('supplies/{supply}/logs', [SupplyController::class, 'addLog']);
    Route::delete('supplies/{supply}/logs/{log}', [SupplyController::class, 'deleteLog']);
});
