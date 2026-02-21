<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminBookingController extends Controller
{
    /**
     * Return all bookings for this tenant, with optional date and status filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $tenant = app('tenant');

        $query = Booking::where('tenant_id', $tenant->id)
            ->with(['teeTimeSlot', 'user']);

        // Filter by date if provided
        if ($request->has('date')) {
            $query->whereHas('teeTimeSlot', fn ($q) => $q->whereDate('date', $request->date));
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $bookings = $query->orderByDesc('created_at')->paginate(50);

        return response()->json($bookings);
    }

    /**
     * Update a booking's status (e.g. cancel or mark as completed).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled,completed',
        ]);

        $tenant = app('tenant');
        $booking = Booking::where('tenant_id', $tenant->id)->findOrFail($id);

        $previousStatus = $booking->status;
        $booking->update(['status' => $request->status]);

        // If cancelling, free up the booked players on the slot
        if ($request->status === 'cancelled' && $previousStatus !== 'cancelled') {
            $booking->teeTimeSlot->decrement('booked_players', $booking->players);
        }

        return response()->json($booking->fresh()->load('teeTimeSlot'));
    }
}
