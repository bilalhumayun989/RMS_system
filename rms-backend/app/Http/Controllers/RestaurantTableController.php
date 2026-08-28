<?php

namespace App\Http\Controllers;

use App\Models\RestaurantTable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RestaurantTableController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(RestaurantTable::query()->orderBy('section')->orderBy('id')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $table = RestaurantTable::create($this->validated($request));

        return response()->json($table, 201);
    }

    public function show(RestaurantTable $table): JsonResponse
    {
        return response()->json($table);
    }

    public function update(Request $request, RestaurantTable $table): JsonResponse
    {
        $table->update($this->validated($request, true));

        return response()->json($table->fresh());
    }

    public function destroy(RestaurantTable $table): JsonResponse
    {
        $table->delete();

        return response()->json(['message' => 'Table deleted.']);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'seats' => [$required, 'integer', 'min:1'],
            'section' => [$required, 'string', 'max:10'],
            'status' => ['sometimes', Rule::in(['available', 'occupied', 'reserved', 'served'])],
            'current_order_code' => ['nullable', 'string', 'max:50'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'duration' => ['nullable', 'integer', 'min:0'],
            'reserved_for' => ['nullable', 'string', 'max:50'],
            'guest_name' => ['nullable', 'string', 'max:255'],
        ]);
    }
}
