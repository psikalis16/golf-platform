<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveTenant
{
    /**
     * Resolve the current tenant from the request's host header.
     * Supports both subdomain routing and custom domain routing.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $host = $request->getHost();

        // Try matching by custom domain first (e.g. www.pinevalleygolf.com)
        $tenant = Tenant::where('custom_domain', $host)
            ->where('is_active', true)
            ->first();

        // Fall back to subdomain matching (e.g. pine-valley.yourdomain.com)
        if (! $tenant) {
            $subdomain = explode('.', $host)[0];
            $tenant = Tenant::where('slug', $subdomain)
                ->where('is_active', true)
                ->first();
        }

        if (! $tenant) {
            return response()->json(['message' => 'Tenant not found.'], 404);
        }

        // Store the resolved tenant on the request for downstream use
        $request->attributes->set('tenant', $tenant);
        app()->instance('tenant', $tenant);

        return $next($request);
    }
}
