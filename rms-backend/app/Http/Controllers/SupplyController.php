<?php

namespace App\Http\Controllers;

use App\Models\Supply;
use App\Models\SupplyLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplyController extends Controller
{
    // ── Supplies CRUD ─────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $query = Supply::query()->orderBy('category')->orderBy('name');

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('low_stock')) {
            $query->whereColumn('quantity', '<=', 'min_quantity');
        }

        $supplies = $query->get()->map(fn(Supply $s) => $this->format($s));

        return response()->json($supplies);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'         => ['required', 'string', 'max:200'],
            'unit'         => ['required', 'string', 'max:50'],
            'quantity'     => ['required', 'numeric', 'min:0'],
            'min_quantity' => ['sometimes', 'numeric', 'min:0'],
            'unit_cost'    => ['nullable', 'numeric', 'min:0'],
            'supplier'     => ['nullable', 'string', 'max:200'],
            'category'     => ['required', 'string', 'max:100'],
            'notes'        => ['nullable', 'string'],
            'is_active'    => ['sometimes', 'boolean'],
        ]);

        $supply = Supply::create($data);

        return response()->json($this->format($supply), 201);
    }

    public function update(Request $request, Supply $supply): JsonResponse
    {
        $data = $request->validate([
            'name'         => ['sometimes', 'required', 'string', 'max:200'],
            'unit'         => ['sometimes', 'required', 'string', 'max:50'],
            'quantity'     => ['sometimes', 'required', 'numeric', 'min:0'],
            'min_quantity' => ['sometimes', 'numeric', 'min:0'],
            'unit_cost'    => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'supplier'     => ['sometimes', 'nullable', 'string', 'max:200'],
            'category'     => ['sometimes', 'required', 'string', 'max:100'],
            'notes'        => ['sometimes', 'nullable', 'string'],
            'is_active'    => ['sometimes', 'boolean'],
        ]);

        $supply->update($data);

        return response()->json($this->format($supply->fresh()));
    }

    public function destroy(Supply $supply): JsonResponse
    {
        $supply->delete();

        return response()->json(['message' => 'Supply deleted.']);
    }

    // ── Supply Logs ───────────────────────────────────────────

    public function logs(Supply $supply): JsonResponse
    {
        return response()->json(
            $supply->logs()->orderByDesc('date')->orderByDesc('created_at')->get()
        );
    }

    public function addLog(Request $request, Supply $supply): JsonResponse
    {
        $data = $request->validate([
            'type'      => ['required', 'in:purchase,usage,adjustment'],
            'quantity'  => ['required', 'numeric'],   // positive or negative
            'unit_cost' => ['nullable', 'numeric', 'min:0'],
            'date'      => ['required', 'date'],
            'notes'     => ['nullable', 'string'],
        ]);

        $log = $supply->logs()->create($data);

        // Adjust supply quantity
        $supply->increment('quantity', $data['quantity']);
        $supply->refresh();

        return response()->json([
            'log'    => $log,
            'supply' => $this->format($supply),
        ], 201);
    }

    public function deleteLog(Supply $supply, SupplyLog $log): JsonResponse
    {
        // Revert the quantity change
        $supply->decrement('quantity', $log->quantity);
        $log->delete();

        $supply->refresh();

        return response()->json([
            'message' => 'Log deleted.',
            'supply'  => $this->format($supply),
        ]);
    }

    // ── Helper ────────────────────────────────────────────────

    private function format(Supply $s): array
    {
        return [
            'id'           => $s->id,
            'name'         => $s->name,
            'unit'         => $s->unit,
            'quantity'     => (float) $s->quantity,
            'min_quantity' => (float) $s->min_quantity,
            'unit_cost'    => $s->unit_cost !== null ? (float) $s->unit_cost : null,
            'supplier'     => $s->supplier,
            'category'     => $s->category,
            'notes'        => $s->notes,
            'is_active'    => $s->is_active,
            'low_stock'    => $s->isLowStock(),
            'created_at'   => $s->created_at,
            'updated_at'   => $s->updated_at,
        ];
    }
}
