<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        defined('ROLE_JOBSEEKER') or define('ROLE_JOBSEEKER', 1);
        defined('ROLE_ADMIN') or define('ROLE_ADMIN', 2);
        defined('ROLE_EMPLOYER') or define('ROLE_EMPLOYER', 3);

        defined('JOB_PENDING') or define('JOB_PENDING', 1);
        defined('JOB_APPROVED') or define('JOB_APPROVED', 2);
        defined('JOB_REJECTED') or define('JOB_REJECTED', 3);
        
        defined('JOB_APPLICATION_PENDING') or define('JOB_APPLICATION_PENDING', 1);
        defined('JOB_APPLICATION_VIEWED') or define('JOB_APPLICATION_VIEWED', 2);
        defined('JOB_APPLICATION_RESUME_VIEWED') or define('JOB_APPLICATION_RESUME_VIEWED', 3);
        defined('JOB_APPLICATION_APPROVED') or define('JOB_APPLICATION_APPROVED', 4);
        defined('JOB_APPLICATION_REJECTED') or define('JOB_APPLICATION_REJECTED', 5);
    }
}
