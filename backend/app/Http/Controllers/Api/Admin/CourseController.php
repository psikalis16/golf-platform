<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    /**
     * Return this tenant's course info.
     */
    public function show(Request $request): JsonResponse
    {
        $tenant = app('tenant');
        return response()->json($tenant->load('course'));
    }

    /**
     * Update course info for this tenant.
     */
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'name'        => 'sometimes|string|max:150',
            'description' => 'sometimes|nullable|string',
            'address'     => 'sometimes|nullable|string',
            'city'        => 'sometimes|nullable|string',
            'state'       => 'sometimes|nullable|string',
            'zip'         => 'sometimes|nullable|string',
            'phone'       => 'sometimes|nullable|string',
            'email'       => 'sometimes|nullable|email',
            'website'     => 'sometimes|nullable|url',
            'holes'       => 'sometimes|integer|in:9,18,27,36',
            'par'         => 'sometimes|integer|min:60|max:80',
            'amenities'   => 'sometimes|nullable|array',
            'hours'       => 'sometimes|nullable|array',
        ]);

        $tenant = app('tenant');
        $course = $tenant->course;

        // Create the course record if it doesn't exist yet
        if (! $course) {
            $course = $tenant->course()->create(array_merge(
                ['name' => $tenant->name],
                $request->only(['name', 'description', 'address', 'city', 'state', 'zip',
                    'phone', 'email', 'website', 'holes', 'par', 'amenities', 'hours'])
            ));
        } else {
            $course->update($request->only([
                'name', 'description', 'address', 'city', 'state', 'zip',
                'phone', 'email', 'website', 'holes', 'par', 'amenities', 'hours',
            ]));
        }

        return response()->json($course->fresh());
    }

    /**
     * Update tenant-level settings (branding, colors, domain).
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $request->validate([
            'name'          => 'sometimes|string|max:150',
            'logo_url'      => 'sometimes|nullable|url',
            'colors'        => 'sometimes|nullable|array',
            'colors.primary'   => 'sometimes|string',
            'colors.secondary' => 'sometimes|string',
            'colors.accent'    => 'sometimes|string',
            'phone'         => 'sometimes|nullable|string',
            'email'         => 'sometimes|nullable|email',
        ]);

        $tenant = app('tenant');
        $tenant->update($request->only(['name', 'logo_url', 'colors', 'phone', 'email']));

        return response()->json($tenant->fresh());
    }
}
