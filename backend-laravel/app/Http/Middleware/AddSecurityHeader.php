<?php
 
namespace App\Http\Middleware;
 
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
 
class AddSecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
 
        $csp_header = "default-src 'self' ; " .
            "script-src 'self' 'unsafe-inline' 'nonce-glicescript' code.jquery.com cdnjs.cloudflare.com unpkg.com kit.fontawesome.com cdn.jsdelivr.net ;" .
            "style-src 'self' 'unsafe-inline' fonts.googleapis.com ;" .
            "font-src 'self' fonts.gstatic.com;" .
            "img-src 'self' data: cdn.example.com";
 
           
        $allowedOrigin = env('CORS_ALLOWED_ORIGIN', '*');
 
        $response->headers->set('Access-Control-Allow-Origin', $allowedOrigin);
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Authorization, Accept');
        $response->headers->set('Access-Control-Allow-Credentials', env('CORS_ALLOW_CREDENTIALS', 'false'));
 
        $response->header('Strict-Transport-Security', 'max-age=31536000');
        // $response->header('Content-Security-Policy', $csp_header);
        $response->header('X-Content-Type-Options', 'nosniff');
        $response->header('X-Frame-Options', 'SAMEORIGIN');
        $response->header('X-XSS-Protection', '1; mode=block');
 
        return $response;
    }
}
 