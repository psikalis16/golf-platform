<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            // Unique slug used for subdomain routing (e.g. "pine-valley" -> pine-valley.yourdomain.com)
            $table->string('slug')->unique();
            $table->string('name');
            // Optional custom domain (e.g. www.pinevalleygolf.com)
            $table->string('custom_domain')->nullable()->unique();
            $table->string('logo_url')->nullable();
            // Brand colors stored as JSON: { primary, secondary, accent }
            $table->json('colors')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
