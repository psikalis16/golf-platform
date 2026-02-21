<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pricing_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            // Specific date override (null = applies to all matching days)
            $table->date('date')->nullable();
            // Day of week override: 0 = Sunday ... 6 = Saturday (null = applies to all days)
            $table->unsignedTinyInteger('day_of_week')->nullable();
            // Name for this rule (e.g. "Weekend Rate", "Holiday Special")
            $table->string('name')->nullable();
            $table->decimal('price_per_player', 8, 2);
            $table->decimal('cart_fee', 8, 2)->default(0);
            // Lower priority number = higher priority (specific date beats day-of-week)
            $table->unsignedTinyInteger('priority')->default(10);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pricing_rules');
    }
};
