<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supply extends Model
{
    protected $fillable = [
        'name', 'unit', 'quantity', 'min_quantity',
        'unit_cost', 'supplier', 'category', 'notes', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'quantity'     => 'decimal:2',
            'min_quantity' => 'decimal:2',
            'unit_cost'    => 'decimal:2',
            'is_active'    => 'boolean',
        ];
    }

    public function logs(): HasMany
    {
        return $this->hasMany(SupplyLog::class);
    }

    /** True when current stock is at or below the minimum threshold. */
    public function isLowStock(): bool
    {
        return $this->quantity <= $this->min_quantity;
    }
}
