<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Course extends Model
{
    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'address',
        'city',
        'state',
        'zip',
        'phone',
        'email',
        'website',
        'holes',
        'par',
        'images',
        'amenities',
        'hours',
    ];

    protected $casts = [
        'images' => 'array',
        'amenities' => 'array',
        'hours' => 'array',
    ];

    // The tenant this course belongs to
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
