<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Link user to a tenant; null means a super-admin
            $table->foreignId('tenant_id')->nullable()->after('id')->constrained()->nullOnDelete();
            // Role: admin = course admin, golfer = regular user
            $table->enum('role', ['admin', 'golfer'])->default('golfer')->after('tenant_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
            $table->dropColumn(['tenant_id', 'role']);
        });
    }
};
