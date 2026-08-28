<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    /**
     * Return all expenses, newest first.
     * Supports ?from=YYYY-MM-DD &to=YYYY-MM-DD &category=X
     */
    public function index(Request $request): JsonResponse
    {
        $query = Expense::query()->orderBy('date', 'desc');

        if ($request->filled('from')) {
            $query->whereDate('date', '>=', $request->input('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('date', '<=', $request->input('to'));
        }

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        return response()->json($query->get());
    }

    /**
     * Create a new expense.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'    => ['required', 'string', 'max:200'],
            'amount'   => ['required', 'numeric', 'min:0'],
            'category' => ['required', 'string', 'max:100'],
            'date'     => ['required', 'date'],
            'notes'    => ['nullable', 'string'],
        ]);

        $expense = Expense::create($data);

        return response()->json($expense, 201);
    }

    /**
     * Update an existing expense (partial update supported).
     */
    public function update(Request $request, Expense $expense): JsonResponse
    {
        $data = $request->validate([
            'title'    => ['sometimes', 'required', 'string', 'max:200'],
            'amount'   => ['sometimes', 'required', 'numeric', 'min:0'],
            'category' => ['sometimes', 'required', 'string', 'max:100'],
            'date'     => ['sometimes', 'required', 'date'],
            'notes'    => ['nullable', 'string'],
        ]);

        $expense->update($data);

        return response()->json($expense->fresh());
    }

    /**
     * Delete an expense.
     */
    public function destroy(Expense $expense): JsonResponse
    {
        $expense->delete();

        return response()->json(['message' => 'Expense deleted.']);
    }
}
