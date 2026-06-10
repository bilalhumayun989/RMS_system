<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    protected $fillable = [
        'name',
        'category',
        'price',
        'emoji',
        'prep_time',
        'popular',
        'description',
        'image',
        'discount',
        'is_available',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'popular' => 'boolean',
            'is_available' => 'boolean',
        ];
    }
}
