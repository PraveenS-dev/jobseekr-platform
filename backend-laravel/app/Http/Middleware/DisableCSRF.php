<?php

namespace App\Http\Middleware;

use Closure;

class DisableCSRF
{
    public function handle($request, Closure $next)
    {
        // Disable CSRF for all POST, PUT, DELETE requests
        return $next($request);
    }
}
