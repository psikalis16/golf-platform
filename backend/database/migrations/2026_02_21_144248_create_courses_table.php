<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zip')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            // Number of holes on the course
            $table->unsignedTinyInteger('holes')->default(18);
            // Course par
            $table->unsignedTinyInteger('par')->default(72);
            // JSON array of image URLs
            $table->json('images')->nullable();
            // Amenities as JSON array of strings (e.g. ["Pro Shop", "Driving Range"])
            $table->json('amenities')->nullable();
            // Hours of operation as JSON object keyed by day
            $table->json('hours')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
