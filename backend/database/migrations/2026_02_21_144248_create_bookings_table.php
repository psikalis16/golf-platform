<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tee_time_slot_id')->constrained()->cascadeOnDelete();
            // User who made the booking; nullable for guest bookings
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            // Guest bookings — contact info stored directly
            $table->string('guest_name')->nullable();
            $table->string('guest_email')->nullable();
            $table->string('guest_phone')->nullable();
            // Number of players in this booking
            $table->unsignedTinyInteger('players')->default(1);
            // Whether a cart was requested
            $table->boolean('cart_requested')->default(false);
            // Total price calculated at booking time
            $table->decimal('total_price', 8, 2)->default(0);
            // Status: pending, confirmed, cancelled, completed
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed'])->default('confirmed');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
