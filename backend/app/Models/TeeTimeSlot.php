<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TeeTimeSlot extends Model
{
    protected $fillable = [
        'tenant_id',
        'date',
        'start_time',
        'max_players',
        'booked_players',
        'price_per_player',
        'cart_fee',
        'walking_allowed',
        'is_available',
    ];

    protected $casts = [
        'date' => 'date',
        'price_per_player' => 'decimal:2',
        'cart_fee' => 'decimal:2',
        'walking_allowed' => 'boolean',
        'is_available' => 'boolean',
    ];

    // Remaining spots on this tee time
    public function getSpotsRemainingAttribute(): int
    {
        return $this->max_players - $this->booked_players;
    }

    // Whether this slot is fully booked
    public function getIsFullAttribute(): bool
    {
        return $this->booked_players >= $this->max_players;
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
