<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Tenant extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'custom_domain',
        'logo_url',
        'colors',
        'email',
        'phone',
        'is_active',
    ];

    protected $casts = [
        // Automatically encode/decode colors as array
        'colors' => 'array',
        'is_active' => 'boolean',
    ];

    // Main course info for this tenant
    public function course(): HasOne
    {
        return $this->hasOne(Course::class);
    }

    // All users (admin + golfers) belonging to this tenant
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    // All tee time slots for this tenant
    public function teeTimeSlots(): HasMany
    {
        return $this->hasMany(TeeTimeSlot::class);
    }

    // All bookings across this tenant's tee times
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    // Days the course is marked as closed
    public function closures(): HasMany
    {
        return $this->hasMany(CourseClosure::class);
    }

    // Pricing rules configured by the course admin
    public function pricingRules(): HasMany
    {
        return $this->hasMany(PricingRule::class);
    }
}
