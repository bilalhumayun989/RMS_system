<?php

namespace App\Http\Controllers;

use App\Models\KitchenOrder;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\RestaurantTable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::query()->with('items')->latest();

        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->input('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->input('to'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'restaurant_table_id' => ['nullable', 'exists:restaurant_tables,id'],
            'order_type' => ['required', Rule::in(['dine-in', 'takeaway', 'delivery'])],
            'items' => ['required', 'array', 'min:1'],
            'items.*.menu_item_id' => ['required', 'exists:menu_items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $order = DB::transaction(function () use ($data) {
            $menuItems = MenuItem::query()
                ->whereIn('id', collect($data['items'])->pluck('menu_item_id'))
                ->get()
                ->keyBy('id');

            $subtotal = collect($data['items'])->sum(
                fn (array $item) => $menuItems[$item['menu_item_id']]->price * $item['quantity']
            );
            $tax = round($subtotal * 0.1, 2);
            $total = round($subtotal + $tax, 2);

            $order = Order::create([
                'code' => 'O'.now()->format('His').random_int(10, 99),
                'restaurant_table_id' => $data['restaurant_table_id'] ?? null,
                'order_type' => $data['order_type'],
                'status' => 'in-progress',
                'subtotal' => $subtotal,
                'tax' => $tax,
                'total' => $total,
            ]);

            foreach ($data['items'] as $item) {
                $menuItem = $menuItems[$item['menu_item_id']];
                $order->items()->create([
                    'menu_item_id' => $menuItem->id,
                    'name' => $menuItem->name,
                    'quantity' => $item['quantity'],
                    'unit_price' => $menuItem->price,
                    'line_total' => $menuItem->price * $item['quantity'],
                ]);
            }

            $estimatedMinutes = $order->items
                ->map(fn ($item) => (int) filter_var($menuItems[$item->menu_item_id]->prep_time, FILTER_SANITIZE_NUMBER_INT))
                ->max() ?: 10;

            $kitchenOrder = KitchenOrder::create([
                'code' => 'K'.now()->format('His').random_int(10, 99),
                'order_id' => $order->id,
                'restaurant_table_id' => $order->restaurant_table_id,
                'status' => 'new',
                'estimated_minutes' => $estimatedMinutes,
            ]);

            foreach ($order->items as $item) {
                $kitchenOrder->items()->create([
                    'name' => $item->name,
                    'quantity' => $item->quantity,
                ]);
            }

            if ($order->restaurant_table_id) {
                RestaurantTable::whereKey($order->restaurant_table_id)->update([
                    'status' => 'occupied',
                    'current_order_code' => $order->code,
                    'amount' => $order->total,
                ]);
            }

            return $order->load('items');
        });

        return response()->json($order, 201);
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json($order->load('items'));
    }

    public function update(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'status' => ['sometimes', Rule::in(['waiting', 'in-progress', 'ready', 'completed'])],
            'paid_at' => ['nullable', 'date'],
        ]);

        $order->update($data);

        return response()->json($order->fresh('items'));
    }

    public function destroy(Order $order): JsonResponse
    {
        $order->delete();

        return response()->json(['message' => 'Order deleted.']);
    }
}
