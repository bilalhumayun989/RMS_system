<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Employee::query()->orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $employee = Employee::create($this->validated($request));

        return response()->json($employee, 201);
    }

    public function show(Employee $employee): JsonResponse
    {
        return response()->json($employee);
    }

    public function update(Request $request, Employee $employee): JsonResponse
    {
        $employee->update($this->validated($request, $employee));

        return response()->json($employee->fresh());
    }

    public function destroy(Employee $employee): JsonResponse
    {
        $employee->delete();

        return response()->json(['message' => 'Employee deleted.']);
    }

    private function validated(Request $request, ?Employee $employee = null): array
    {
        $emailRule = Rule::unique('employees', 'email');

        if ($employee !== null) {
            $emailRule->ignore($employee->id);
        }

        return $request->validate([
            'name' => [$employee ? 'sometimes' : 'required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', $emailRule],
            'phone' => ['nullable', 'string', 'max:50'],
            'role' => [$employee ? 'sometimes' : 'required', Rule::in(['staff', 'admin', 'kitchen', 'manager'])],
            'pin' => ['nullable', 'string', 'max:20'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }
}
