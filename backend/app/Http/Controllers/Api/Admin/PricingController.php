<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PricingRule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PricingController extends Controller
{
    /**
     * Return all pricing rules for this tenant.
     */
    public function index(): JsonResponse
    {
        $tenant = app('tenant');

        $rules = PricingRule::where('tenant_id', $tenant->id)
            ->orderBy('priority')
            ->orderBy('date')
            ->get();

        return response()->json($rules);
    }

    /**
     * Create a new pricing rule.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'             => 'nullable|string|max:100',
            'date'             => 'nullable|date',
            'day_of_week'      => 'nullable|integer|between:0,6',
            'price_per_player' => 'required|numeric|min:0',
            'cart_fee'         => 'required|numeric|min:0',
            'priority'         => 'integer|min:1|max:100',
        ]);

        $tenant = app('tenant');

        $rule = PricingRule::create(array_merge(
            $request->only(['name', 'date', 'day_of_week', 'price_per_player', 'cart_fee', 'priority']),
            ['tenant_id' => $tenant->id]
        ));

        return response()->json($rule, 201);
    }

    /**
     * Update an existing pricing rule.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $tenant = app('tenant');
        $rule = PricingRule::where('tenant_id', $tenant->id)->findOrFail($id);

        $rule->update($request->only([
            'name', 'date', 'day_of_week', 'price_per_player', 'cart_fee', 'priority',
        ]));

        return response()->json($rule->fresh());
    }

    /**
     * Delete a pricing rule.
     */
    public function destroy(int $id): JsonResponse
    {
        $tenant = app('tenant');

        PricingRule::where('tenant_id', $tenant->id)
            ->findOrFail($id)
            ->delete();

        return response()->json(null, 204);
    }
}
