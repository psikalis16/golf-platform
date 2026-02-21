<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeeTimeSlot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeeTimeController extends Controller
{
    /**
     * Return all tee time slots for a given date range.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
        ]);

        $tenant = app('tenant');

        $slots = TeeTimeSlot::where('tenant_id', $tenant->id)
            ->whereBetween('date', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59'
            ])
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();

        return response()->json($slots);
    }

    /**
     * Create a single tee time slot.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'date'             => 'required|date|after_or_equal:today',
            'start_time'       => 'required|date_format:H:i',
            'max_players'      => 'required|integer|min:1|max:4',
            'price_per_player' => 'required|numeric|min:0',
            'cart_fee'         => 'required|numeric|min:0',
            'walking_allowed'  => 'boolean',
            'is_available'     => 'boolean',
        ]);

        $tenant = app('tenant');

        $slot = TeeTimeSlot::create(array_merge(
            $request->only(['date', 'start_time', 'max_players', 'price_per_player',
                'cart_fee', 'walking_allowed', 'is_available']),
            ['tenant_id' => $tenant->id]
        ));

        return response()->json($slot, 201);
    }

    /**
     * Bulk-create tee time slots for a date/time range.
     * Useful for setting up a whole week of tee times at once.
     */
    public function bulkStore(Request $request): JsonResponse
    {
        $request->validate([
            'start_date'       => 'required|date',
            'end_date'         => 'required|date|after_or_equal:start_date',
            'interval_minutes' => 'required|integer|in:8,10,12,15,20,30',
            'first_tee_time'   => 'required|date_format:H:i',
            'last_tee_time'    => 'required|date_format:H:i|after:first_tee_time',
            'max_players'      => 'required|integer|min:1|max:4',
            'price_per_player' => 'required|numeric|min:0',
            'cart_fee'         => 'required|numeric|min:0',
            'walking_allowed'  => 'boolean',
            'days_of_week'     => 'required|array|min:1',
            'days_of_week.*'   => 'integer|between:0,6',
        ]);

        $tenant = app('tenant');

        $start = \Carbon\Carbon::parse($request->start_date);
        $end   = \Carbon\Carbon::parse($request->end_date);
        $created = [];

        // Iterate day by day
        for ($day = $start->copy(); $day->lte($end); $day->addDay()) {
            // Skip days not in the requested days_of_week
            if (! in_array($day->dayOfWeek, $request->days_of_week)) {
                continue;
            }

            $current = \Carbon\Carbon::parse($day->format('Y-m-d') . ' ' . $request->first_tee_time);
            $last    = \Carbon\Carbon::parse($day->format('Y-m-d') . ' ' . $request->last_tee_time);

            while ($current->lte($last)) {
                // Use updateOrCreate to avoid duplicates if run multiple times
                $slot = TeeTimeSlot::updateOrCreate(
                    ['tenant_id' => $tenant->id, 'date' => $day->format('Y-m-d'), 'start_time' => $current->format('H:i:s')],
                    [
                        'max_players'      => $request->max_players,
                        'price_per_player' => $request->price_per_player,
                        'cart_fee'         => $request->cart_fee,
                        'walking_allowed'  => $request->boolean('walking_allowed', true),
                        'is_available'     => true,
                    ]
                );
                $created[] = $slot;
                $current->addMinutes($request->interval_minutes);
            }
        }

        return response()->json(['created' => count($created)], 201);
    }

    /**
     * Update a single tee time slot.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $tenant = app('tenant');

        $slot = TeeTimeSlot::where('tenant_id', $tenant->id)->findOrFail($id);

        $slot->update($request->only([
            'price_per_player', 'cart_fee', 'walking_allowed', 'is_available', 'max_players',
        ]));

        return response()->json($slot->fresh());
    }

    /**
     * Delete a tee time slot (only if no bookings exist for it).
     */
    public function destroy(int $id): JsonResponse
    {
        $tenant = app('tenant');

        $slot = TeeTimeSlot::where('tenant_id', $tenant->id)->findOrFail($id);

        if ($slot->bookings()->count() > 0) {
            return response()->json(['message' => 'Cannot delete a slot with existing bookings.'], 422);
        }

        $slot->delete();

        return response()->json(null, 204);
    }
}
