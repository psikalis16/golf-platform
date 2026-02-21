<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tee_time_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            // Date and start time for this tee time slot
            $table->date('date');
            $table->time('start_time');
            // Maximum number of players that can book this slot
            $table->unsignedTinyInteger('max_players')->default(4);
            // Current number of players booked
            $table->unsignedTinyInteger('booked_players')->default(0);
            // Pricing for this slot (can override pricing_rules)
            $table->decimal('price_per_player', 8, 2)->default(0);
            $table->decimal('cart_fee', 8, 2)->default(0);
            // Whether walking is allowed for this slot
            $table->boolean('walking_allowed')->default(true);
            // Whether this slot is available for booking
            $table->boolean('is_available')->default(true);
            $table->timestamps();

            // Prevent duplicate slots for same tenant/date/time
            $table->unique(['tenant_id', 'date', 'start_time']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tee_time_slots');
    }
};
