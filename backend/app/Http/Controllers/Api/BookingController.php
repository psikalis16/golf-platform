<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\TeeTimeSlot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    /**
     * Create a new booking for a tee time slot.
     * Supports both authenticated golfers and unauthenticated guests.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'tee_time_slot_id' => 'required|integer|exists:tee_time_slots,id',
            'players'          => 'required|integer|min:1|max:4',
            'cart_requested'   => 'boolean',
            'notes'            => 'nullable|string|max:500',
            // Guest fields — required only if not logged in
            'guest_name'       => 'required_without:user|string|max:100',
            'guest_email'      => 'required_without:user|email|max:150',
            'guest_phone'      => 'nullable|string|max:20',
        ]);

        $tenant = app('tenant');
        $slot = TeeTimeSlot::where('tenant_id', $tenant->id)
            ->where('id', $request->tee_time_slot_id)
            ->where('is_available', true)
            ->firstOrFail();

        // Ensure enough spots remain
        if ($slot->spots_remaining < $request->players) {
            return response()->json([
                'message' => 'Not enough spots remaining on this tee time.',
            ], 422);
        }

        // Wrap slot update + booking creation in a transaction
        $booking = DB::transaction(function () use ($request, $slot, $tenant) {
            // Calculate total price
            $cartFee = $request->cart_requested ? ($slot->cart_fee * $request->players) : 0;
            $totalPrice = ($slot->price_per_player * $request->players) + $cartFee;

            // Increment booked player count on the slot
            $slot->increment('booked_players', $request->players);

            return Booking::create([
                'tenant_id'       => $tenant->id,
                'tee_time_slot_id' => $slot->id,
                'user_id'         => $request->user()?->id,
                'guest_name'      => $request->guest_name,
                'guest_email'     => $request->guest_email,
                'guest_phone'     => $request->guest_phone,
                'players'         => $request->players,
                'cart_requested'  => $request->boolean('cart_requested'),
                'total_price'     => $totalPrice,
                'status'          => 'confirmed',
                'notes'           => $request->notes,
            ]);
        });

        return response()->json($booking->load('teeTimeSlot'), 201);
    }

    /**
     * Return bookings for the currently authenticated golfer.
     */
    public function myBookings(Request $request): JsonResponse
    {
        $tenant = app('tenant');

        $bookings = Booking::where('tenant_id', $tenant->id)
            ->where('user_id', $request->user()->id)
            ->with('teeTimeSlot')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($bookings);
    }
}
