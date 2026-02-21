<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PricingRule extends Model
{
    protected $fillable = [
        'tenant_id',
        'date',
        'day_of_week',
        'name',
        'price_per_player',
        'cart_fee',
        'priority',
    ];

    protected $casts = [
        'date' => 'date',
        'price_per_player' => 'decimal:2',
        'cart_fee' => 'decimal:2',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
