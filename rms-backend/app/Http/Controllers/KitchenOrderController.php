<?php

namespace App\Http\Controllers;

use App\Models\KitchenOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class KitchenOrderController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(KitchenOrder::query()->with('items')->latest()->get());
    }

    public function show(KitchenOrder $kitchenOrder): JsonResponse
    {
        return response()->json($kitchenOrder->load('items'));
    }

    public function update(Request $request, KitchenOrder $kitchenOrder): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['new', 'cooking', 'ready'])],
        ]);

        $kitchenOrder->update($data);

        return response()->json($kitchenOrder->fresh('items'));
    }

    public function destroy(KitchenOrder $kitchenOrder): JsonResponse
    {
        $kitchenOrder->delete();

        return response()->json(['message' => 'Kitchen order deleted.']);
    }
}
