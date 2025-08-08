<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\JobSeekr\JobController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\JobSeekr\AdminController;
use App\Http\Controllers\Admin\JobSeekr\AdminJobController;
use App\Http\Controllers\Admin\JobSeekr\BookmarkController;
use App\Http\Controllers\Admin\JobSeekr\ApplicationController;

Route::middleware('api')->group(function () {

    Route::post('/login',    [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/users/userNameUnique', [UserController::class, 'userNameUnique']);
    Route::post('/users/emailUnique', [UserController::class, 'emailUnique']);
    Route::post('/users/{id}/public-key', [UserController::class, 'storePublicKey']);
    Route::get('/users/{id}/public-key', [UserController::class, 'getPublicKey']);
    Route::get('/jobs/list', [JobController::class, 'list']);

    Route::get('/migrate-debug', function () {
        try {
            Artisan::call('migrate', ['--force' => true]);
            return nl2br(Artisan::output());
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    });

    Route::get('/storage-link-debug', function () {
        try {
            Artisan::call('storage:link');
            return nl2br(Artisan::output());
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    });


    Route::get('/reset', function () {
        Artisan::call('migrate:reset', ['--force' => true]);
        Artisan::call('migrate', ['--force' => true]);
        return 'Migration reset and re-run!';
    });

    Route::get('/check-db', function () {
        return DB::select('SELECT DATABASE() AS db_name');
    });

    Route::middleware('jwt.auth')->group(function () {
        Route::get('/user',   [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);

        // Job Seekers
        Route::post('/jobs/store', [JobController::class, 'store']);
        Route::get('/jobs/view/{id}', [JobController::class, 'view']);

        Route::post('/notification/store', [NotificationController::class, 'store']);
        Route::get('/notification/getNotification', [NotificationController::class, 'getNotification']);
        Route::get('/notification/getAllUnreadNotification', [NotificationController::class, 'getAllUnreadNotification']);
        Route::post('/notification/markAllRead', [NotificationController::class, 'markAllRead']);

        Route::get('/application/list', [ApplicationController::class, 'list']);
        Route::post('/apply', [ApplicationController::class, 'apply']);
        Route::get('/application/view', [ApplicationController::class, 'view']);
        Route::post('/application/checkJobApplication', [ApplicationController::class, 'checkJobApplication']);
        Route::post('/application/getApplicationBasedonJobs', [ApplicationController::class, 'getApplicationBasedonJobs']);
        Route::post('/application/applicationViewed', [ApplicationController::class, 'applicationViewed']);
        Route::post('/application/resumeViewed', [ApplicationController::class, 'resumeViewed']);
        Route::post('/application/approval', [ApplicationController::class, 'approval']);

        Route::get('/bookmarks/list', [BookmarkController::class, 'list']);
        Route::post('/bookmark/store', [BookmarkController::class, 'store']);
        Route::post('/bookmark/remove', [BookmarkController::class, 'remove']);
        Route::get('/bookmark/getdata', [BookmarkController::class, 'getBookmarkdata']);

        Route::get('/users/list', [UserController::class, 'list']);
        Route::post('/users/statuschange', [UserController::class, 'statuschange']);
        Route::post('/users/deleteUser', [UserController::class, 'deleteUser']);
        Route::get('/users/view', [UserController::class, 'view']);
        Route::get('/users/profile', [UserController::class, 'profile']);
        Route::post('/users/update', [UserController::class, 'update']);

        Route::get('/users/exp', [UserController::class, 'users_exp']);

        Route::post('/users/changeCoverimage', [UserController::class, 'changeCoverimage']);
        Route::post('/users/changeProfileimage', [UserController::class, 'changeProfileimage']);

        // Connections
        Route::get('/users/connections', [AdminController::class, 'getConnections']);
        Route::get('/users/search-connections', [AdminController::class, 'searchConnections']);

        // Admin-only
        // Route::middleware('admin')->group(function () {
        Route::post('/approve-job/{id}', [AdminJobController::class, 'approve']);

        Route::get('/admin/dashboard', [AdminController::class, 'dashboardStats']);
        // });
    });
});
