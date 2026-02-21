<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CourseClosure;
use App\Models\PricingRule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClosureController extends Controller
{
    /**
     * Return all closure dates for this tenant.
     */
    public function index(): JsonResponse
    {
        $tenant = app('tenant');

        $closures = CourseClosure::where('tenant_id', $tenant->id)
            ->orderBy('date')
            ->get();

        return response()->json($closures);
    }

    /**
     * Mark a date as closed.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'date'   => 'required|date',
            'reason' => 'nullable|string|max:255',
        ]);

        $tenant = app('tenant');

        $closure = CourseClosure::updateOrCreate(
            ['tenant_id' => $tenant->id, 'date' => $request->date],
            ['reason' => $request->reason]
        );

        return response()->json($closure, 201);
    }

    /**
     * Remove a closure date (re-opens the course on that day).
     */
    public function destroy(int $id): JsonResponse
    {
        $tenant = app('tenant');

        CourseClosure::where('tenant_id', $tenant->id)
            ->findOrFail($id)
            ->delete();

        return response()->json(null, 204);
    }
}
