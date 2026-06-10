<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurant_tables', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('seats');
            $table->string('section', 10);
            $table->string('status')->default('available');
            $table->string('current_order_code')->nullable();
            $table->decimal('amount', 10, 2)->nullable();
            $table->unsignedInteger('duration')->nullable();
            $table->string('reserved_for')->nullable();
            $table->string('guest_name')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant_tables');
    }
};
