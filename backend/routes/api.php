<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\Admin\AdminBookingController;
use App\Http\Controllers\Api\Admin\ClosureController;
use App\Http\Controllers\Api\Admin\CourseController;
use App\Http\Controllers\Api\Admin\PricingController;
use App\Http\Controllers\Api\Admin\TeeTimeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — All routes run through the ResolveTenant middleware first.
|--------------------------------------------------------------------------
*/

Route::middleware('resolve.tenant')->group(function () {

    // Public routes — no authentication needed
    Route::get('/tenant', [PublicController::class, 'tenant']);
    Route::get('/tee-times', [PublicController::class, 'teeTimesForDate']);
    Route::get('/closures', [PublicController::class, 'closuresForMonth']);

    // Auth routes
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Authenticated golfer routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        // Change password and clear the must_change_password flag
        Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

        // Booking — open to any authenticated user (golfer or admin)
        Route::post('/bookings', [BookingController::class, 'store']);
        Route::get('/bookings/my', [BookingController::class, 'myBookings']);
    });

    // Admin-only routes — must be authenticated AND have role=admin
    Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {

        // Course info + tenant settings
        Route::get('/course', [CourseController::class, 'show']);
        Route::put('/course', [CourseController::class, 'update']);
        Route::put('/settings', [CourseController::class, 'updateSettings']);

        // Tee time slot management
        Route::get('/tee-times', [TeeTimeController::class, 'index']);
        Route::post('/tee-times', [TeeTimeController::class, 'store']);
        Route::post('/tee-times/bulk', [TeeTimeController::class, 'bulkStore']);
        Route::put('/tee-times/{id}', [TeeTimeController::class, 'update']);
        Route::delete('/tee-times/{id}', [TeeTimeController::class, 'destroy']);

        // Bookings management
        Route::get('/bookings', [AdminBookingController::class, 'index']);
        Route::put('/bookings/{id}', [AdminBookingController::class, 'update']);

        // Course closure management
        Route::get('/closures', [ClosureController::class, 'index']);
        Route::post('/closures', [ClosureController::class, 'store']);
        Route::delete('/closures/{id}', [ClosureController::class, 'destroy']);

        // Pricing rule management
        Route::get('/pricing', [PricingController::class, 'index']);
        Route::post('/pricing', [PricingController::class, 'store']);
        Route::put('/pricing/{id}', [PricingController::class, 'update']);
        Route::delete('/pricing/{id}', [PricingController::class, 'destroy']);
    });
});
