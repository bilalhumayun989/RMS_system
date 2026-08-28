<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\MenuItem;
use App\Models\RestaurantTable;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::query()->firstOrCreate(
            ['email' => 'test@example.com'],
            ['name' => 'Test User', 'password' => 'password']
        );

        $adminRole = Role::query()->firstOrCreate(['name' => 'Admin'], ['permissions' => ['/dashboard', '/tables', '/order', '/payment', '/kitchen', '/settings']]);

        Employee::query()->upsert([
            ['name' => 'Safullah Zafar', 'email' => 'safullahzafar@gmail.com', 'phone' => null, 'role_id' => $adminRole->id, 'pin' => null, 'password' => Hash::make('12345678'), 'is_active' => true],
        ], ['email'], ['name', 'phone', 'role_id', 'pin', 'password', 'is_active']);

        foreach ([
            ['id' => 1, 'seats' => 2, 'section' => 'A', 'status' => 'available'],
            ['id' => 2, 'seats' => 4, 'section' => 'A', 'status' => 'occupied', 'current_order_code' => 'O001', 'amount' => 36.35, 'duration' => 45],
            ['id' => 3, 'seats' => 4, 'section' => 'A', 'status' => 'occupied', 'current_order_code' => 'O002', 'amount' => 25.98, 'duration' => 22],
            ['id' => 4, 'seats' => 6, 'section' => 'B', 'status' => 'available'],
            ['id' => 5, 'seats' => 2, 'section' => 'B', 'status' => 'reserved', 'reserved_for' => '19:00', 'guest_name' => 'Ahmed'],
            ['id' => 6, 'seats' => 8, 'section' => 'B', 'status' => 'available'],
            ['id' => 7, 'seats' => 4, 'section' => 'C', 'status' => 'occupied', 'current_order_code' => 'O003', 'amount' => 48.50, 'duration' => 67],
            ['id' => 8, 'seats' => 2, 'section' => 'C', 'status' => 'available'],
            ['id' => 9, 'seats' => 6, 'section' => 'C', 'status' => 'reserved', 'reserved_for' => '20:30', 'guest_name' => 'Sara'],
            ['id' => 10, 'seats' => 4, 'section' => 'D', 'status' => 'available'],
            ['id' => 11, 'seats' => 2, 'section' => 'D', 'status' => 'occupied', 'current_order_code' => 'O004', 'amount' => 12.00, 'duration' => 15],
            ['id' => 12, 'seats' => 8, 'section' => 'D', 'status' => 'available'],
        ] as $table) {
            RestaurantTable::query()->updateOrCreate(['id' => $table['id']], $table);
        }

        foreach ([
            ['id' => 1, 'name' => 'Southwest Scramble Bowl', 'category' => 'Breakfast', 'price' => 16.99, 'emoji' => 'eggs', 'prep_time' => '10 min', 'popular' => true, 'description' => 'Seasoned scrambled eggs served with warm toast.', 'image' => 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=600&auto=format&fit=crop'],
            ['id' => 2, 'name' => 'Croissant French Toast', 'category' => 'Breakfast', 'price' => 14.29, 'emoji' => 'toast', 'prep_time' => '12 min', 'popular' => false, 'description' => 'Buttery croissant grilled and topped with sugar.', 'image' => 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=600&auto=format&fit=crop'],
            ['id' => 3, 'name' => 'Oatmeal Breakfast', 'category' => 'Breakfast', 'price' => 16.49, 'emoji' => 'bowl', 'prep_time' => '8 min', 'popular' => false, 'description' => 'Brown sugar, raisins, and seasonal fruit.', 'image' => 'https://plus.unsplash.com/premium_photo-1663924211473-132ef5383e04?q=80&w=870&auto=format&fit=crop'],
            ['id' => 4, 'name' => 'Western Omelette', 'category' => 'Breakfast', 'price' => 19.36, 'emoji' => 'eggs', 'prep_time' => '10 min', 'popular' => false, 'description' => 'Omelette with cheese, ham, mushrooms, potato, onions, and sauce.', 'discount' => 12, 'image' => 'https://plus.unsplash.com/premium_photo-1693086420454-7568e3b8c308?q=80&w=600&auto=format&fit=crop'],
            ['id' => 5, 'name' => 'Belgian Waffle', 'category' => 'Breakfast', 'price' => 12.99, 'emoji' => 'waffle', 'prep_time' => '15 min', 'popular' => true, 'description' => 'Crispy waffles topped with berries and syrup.', 'image' => 'https://images.unsplash.com/photo-1647209850142-f035ac0b22a8?q=80&w=600&auto=format&fit=crop'],
            ['id' => 6, 'name' => 'Grilled Burger', 'category' => 'Fastfood', 'price' => 12.00, 'emoji' => 'burger', 'prep_time' => '15 min', 'popular' => true, 'description' => 'Beef patty with lettuce, tomato, cheese, and sauce.', 'image' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop'],
            ['id' => 7, 'name' => 'Margherita Pizza', 'category' => 'Fastfood', 'price' => 14.50, 'emoji' => 'pizza', 'prep_time' => '20 min', 'popular' => true, 'description' => 'Classic pizza with mozzarella, basil, and tomato sauce.', 'image' => 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop'],
            ['id' => 8, 'name' => 'Crispy French Fries', 'category' => 'Fastfood', 'price' => 4.99, 'emoji' => 'fries', 'prep_time' => '7 min', 'popular' => false, 'description' => 'Golden salted potato fries.', 'image' => 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop'],
            ['id' => 9, 'name' => 'BBQ Chicken Wings', 'category' => 'Fastfood', 'price' => 9.99, 'emoji' => 'wings', 'prep_time' => '12 min', 'popular' => false, 'description' => 'Chicken wings tossed in smoky BBQ sauce.', 'image' => 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=600&auto=format&fit=crop'],
            ['id' => 10, 'name' => 'Grilled Salmon', 'category' => 'Seafood', 'price' => 21.00, 'emoji' => 'fish', 'prep_time' => '18 min', 'popular' => true, 'description' => 'Salmon fillet grilled with lemon butter sauce.', 'image' => 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?q=80&w=600&auto=format&fit=crop'],
            ['id' => 11, 'name' => 'Garlic Butter Shrimp', 'category' => 'Seafood', 'price' => 18.50, 'emoji' => 'shrimp', 'prep_time' => '14 min', 'popular' => false, 'description' => 'Shrimp cooked in garlic butter sauce.', 'image' => 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=600&auto=format&fit=crop'],
            ['id' => 12, 'name' => 'Fish and Chips', 'category' => 'Seafood', 'price' => 15.99, 'emoji' => 'fish', 'prep_time' => '15 min', 'popular' => false, 'description' => 'Crispy battered cod with tartar sauce and chips.', 'image' => 'https://plus.unsplash.com/premium_photo-1694108747175-889fdc786003?q=80&w=600&auto=format&fit=crop'],
            ['id' => 13, 'name' => 'Seafood Paella', 'category' => 'Seafood', 'price' => 24.99, 'emoji' => 'rice', 'prep_time' => '22 min', 'popular' => true, 'description' => 'Saffron rice cooked with shrimp, mussels, and calamari.', 'image' => 'https://images.unsplash.com/photo-1623961990059-28356e226a77?q=80&w=871&auto=format&fit=crop'],
            ['id' => 14, 'name' => 'Chocolate Lava Cake', 'category' => 'Desserts', 'price' => 6.50, 'emoji' => 'cake', 'prep_time' => '10 min', 'popular' => true, 'description' => 'Warm chocolate cake with a molten center.', 'image' => 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop'],
            ['id' => 15, 'name' => 'Cheesecake Slice', 'category' => 'Desserts', 'price' => 5.80, 'emoji' => 'cake', 'prep_time' => '8 min', 'popular' => false, 'description' => 'New York style cheesecake with strawberry compote.', 'image' => 'https://plus.unsplash.com/premium_photo-1701294050701-3c9e4cb1e43f?q=80&w=870&auto=format&fit=crop'],
            ['id' => 16, 'name' => 'Ice Cream Sundae', 'category' => 'Desserts', 'price' => 4.99, 'emoji' => 'ice cream', 'prep_time' => '5 min', 'popular' => false, 'description' => 'Vanilla, chocolate, and strawberry ice cream.', 'image' => 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=600&auto=format&fit=crop'],
            ['id' => 17, 'name' => 'Tiramisu Cup', 'category' => 'Desserts', 'price' => 7.20, 'emoji' => 'coffee', 'prep_time' => '6 min', 'popular' => true, 'description' => 'Coffee-soaked dessert with mascarpone.', 'image' => 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=600&auto=format&fit=crop'],
        ] as $menuItem) {
            MenuItem::query()->updateOrCreate(['id' => $menuItem['id']], $menuItem);
        }
    }
}
