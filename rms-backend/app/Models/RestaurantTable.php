<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RestaurantTable extends Model
{
    protected $fillable = [
        'seats',
        'section',
        'status',
        'current_order_code',
        'amount',
        'duration',
        'reserved_for',
        'guest_name',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
        ];
    }
}
