<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('supplies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('unit')->default('pcs');          // kg, litre, pcs, box, etc.
            $table->decimal('quantity', 10, 2)->default(0);  // current stock
            $table->decimal('min_quantity', 10, 2)->default(0); // low-stock threshold
            $table->decimal('unit_cost', 10, 2)->nullable(); // cost per unit
            $table->string('supplier')->nullable();
            $table->string('category')->default('General');  // Food, Beverage, Cleaning, Packaging, General
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Supply purchase/usage log
        Schema::create('supply_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supply_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['purchase', 'usage', 'adjustment'])->default('purchase');
            $table->decimal('quantity', 10, 2);   // positive = added, negative = used/removed
            $table->decimal('unit_cost', 10, 2)->nullable();
            $table->date('date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supply_logs');
        Schema::dropIfExists('supplies');
    }
};
