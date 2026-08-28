<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuItemController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(MenuItem::query()->orderBy('category')->orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $item = MenuItem::create($this->validated($request));

        return response()->json($item, 201);
    }

    public function show(MenuItem $menuItem): JsonResponse
    {
        return response()->json($menuItem);
    }

    public function update(Request $request, MenuItem $menuItem): JsonResponse
    {
        $menuItem->update($this->validated($request, true));

        return response()->json($menuItem->fresh());
    }

    public function destroy(MenuItem $menuItem): JsonResponse
    {
        $menuItem->delete();

        return response()->json(['message' => 'Menu item deleted.']);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'name' => [$required, 'string', 'max:255'],
            'category' => [$required, 'string', 'max:100'],
            'price' => [$required, 'numeric', 'min:0'],
            'emoji' => ['nullable', 'string', 'max:50'],
            'prep_time' => ['sometimes', 'string', 'max:50'],
            'popular' => ['sometimes', 'boolean'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string'],
            'discount' => ['nullable', 'integer', 'min:0', 'max:100'],
            'is_available' => ['sometimes', 'boolean'],
        ]);
    }
}
