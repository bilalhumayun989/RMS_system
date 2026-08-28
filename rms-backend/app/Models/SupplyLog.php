<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplyLog extends Model
{
    protected $fillable = [
        'supply_id', 'type', 'quantity', 'unit_cost', 'date', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'quantity'  => 'decimal:2',
            'unit_cost' => 'decimal:2',
            'date'      => 'date',
        ];
    }

    public function supply(): BelongsTo
    {
        return $this->belongsTo(Supply::class);
    }
}
