<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    protected $fillable = [
        'tenant_id',
        'tee_time_slot_id',
        'user_id',
        'guest_name',
        'guest_email',
        'guest_phone',
        'players',
        'cart_requested',
        'total_price',
        'status',
        'notes',
    ];

    protected $casts = [
        'cart_requested' => 'boolean',
        'total_price' => 'decimal:2',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function teeTimeSlot(): BelongsTo
    {
        return $this->belongsTo(TeeTimeSlot::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Convenience: display name for this booking (user or guest)
    public function getBookerNameAttribute(): string
    {
        return $this->user?->name ?? $this->guest_name ?? 'Unknown';
    }
}
