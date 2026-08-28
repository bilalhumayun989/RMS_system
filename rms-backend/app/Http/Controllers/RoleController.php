<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Role::withCount('employees')->orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $role = Role::create($this->validated($request));

        return response()->json($role, 201);
    }

    public function show(Role $role): JsonResponse
    {
        return response()->json($role);
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        $role->update($this->validated($request, $role));

        return response()->json($role->fresh());
    }

    public function destroy(Role $role): JsonResponse
    {
        if ($role->employees()->exists()) {
            return response()->json(['message' => 'Cannot delete role with assigned employees.'], 400);
        }

        $role->delete();

        return response()->json(['message' => 'Role deleted.']);
    }

    private function validated(Request $request, ?Role $role = null): array
    {
        return $request->validate([
            'name' => [$role ? 'sometimes' : 'required', 'string', 'max:255', 'unique:roles,name' . ($role ? ',' . $role->id : '')],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string'],
        ]);
    }
}
