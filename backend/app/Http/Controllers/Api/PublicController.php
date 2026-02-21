<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CourseClosure;
use App\Models\TeeTimeSlot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    /**
     * Return the current tenant and its course info.
     * The frontend calls this on boot to populate the TenantContext.
     */
    public function tenant(Request $request): JsonResponse
    {
        $tenant = app('tenant');
        $tenant->load('course');

        return response()->json($tenant);
    }

    /**
     * Return available tee time slots for a given date.
     * Excludes fully booked slots and slots on closed days.
     */
    public function teeTimesForDate(Request $request): JsonResponse
    {
        $request->validate(['date' => 'required|date']);

        $tenant = app('tenant');
        $date = $request->date;

        // Check if the course is closed on this date
        $isClosed = CourseClosure::where('tenant_id', $tenant->id)
            ->whereDate('date', $date)
            ->exists();

        if ($isClosed) {
            return response()->json(['closed' => true, 'slots' => []]);
        }

        // Return available slots for this date with remaining spots appended
        $slots = TeeTimeSlot::where('tenant_id', $tenant->id)
            ->whereDate('date', $date)
            ->where('is_available', true)
            ->whereRaw('booked_players < max_players')
            ->orderBy('start_time')
            ->get()
            ->map(function ($slot) {
                return array_merge($slot->toArray(), [
                    'spots_remaining' => $slot->spots_remaining,
                ]);
            });

        return response()->json(['closed' => false, 'slots' => $slots]);
    }

    /**
     * Return all closure dates for a given month so the frontend
     * can shade calendar days as closed.
     */
    public function closuresForMonth(Request $request): JsonResponse
    {
        $request->validate([
            'year'  => 'required|integer',
            'month' => 'required|integer|min:1|max:12',
        ]);

        $tenant = app('tenant');

        $closures = CourseClosure::where('tenant_id', $tenant->id)
            ->whereYear('date', $request->year)
            ->whereMonth('date', $request->month)
            ->pluck('date')
            ->map(fn ($d) => $d->format('Y-m-d'));

        return response()->json($closures);
    }
}
