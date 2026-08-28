import { Table, MenuItem, KitchenOrder } from '../types';

export const MOCK_TABLES: Table[] = [
  { id: 1, seats: 2, status: 'available', section: 'A' },
  { id: 2, seats: 4, status: 'occupied', section: 'A', orderId: 'O001', amount: 36.35, duration: 45 },
  { id: 3, seats: 4, status: 'occupied', section: 'A', orderId: 'O002', amount: 25.98, duration: 22 },
  { id: 4, seats: 6, status: 'available', section: 'B' },
  { id: 5, seats: 2, status: 'reserved', section: 'B', reservedFor: '19:00', guestName: 'Ahmed' },
  { id: 6, seats: 8, status: 'available', section: 'B' },
  { id: 7, seats: 4, status: 'occupied', section: 'C', orderId: 'O003', amount: 48.50, duration: 67 },
  { id: 8, seats: 2, status: 'available', section: 'C' },
  { id: 9, seats: 6, status: 'reserved', section: 'C', reservedFor: '20:30', guestName: 'Sara' },
  { id: 10, seats: 4, status: 'available', section: 'D' },
  { id: 11, seats: 2, status: 'occupied', section: 'D', orderId: 'O004', amount: 12.00, duration: 15 },
  { id: 12, seats: 8, status: 'available', section: 'D' },
];

export const MOCK_MENU: Record<string, MenuItem[]> = {
  Breakfast: [
    {
      id: 1,
      name: 'Southwest Scramble Bowl',
      price: 16.99,
      emoji: '🍳',
      prepTime: '10 min',
      popular: true,
      description: 'perfectly seasoned scrambled eggs served with a side of warm toast.',
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 2,
      name: 'Croissant French Toast',
      price: 14.29,
      emoji: '🥐',
      prepTime: '12 min',
      popular: false,
      description: 'Two pieces of light, buttery croissant, grilled to perfection topped with sugar.',
      image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 3,
      name: 'Oatmeal Breakfast',
      price: 16.49,
      emoji: '🥣',
      prepTime: '8 min',
      popular: false,
      description: 'a harmonious blend of brown sugar, raisins, and a side of seasonal fruit.',
      image: 'https://plus.unsplash.com/premium_photo-1663924211473-132ef5383e04?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
      id: 4,
      name: 'Western Omelette',
      price: 19.36,
      emoji: '🍳',
      prepTime: '10 min',
      popular: false,
      description: 'omelette with cheddar cheese, ham, mushrooms, potato, onions, & sauce.',
      image: 'https://plus.unsplash.com/premium_photo-1693086420454-7568e3b8c308?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      discount: 12
    },
    {
      id: 5,
      name: 'Belgian Waffle',
      price: 12.99,
      emoji: '🧇',
      prepTime: '15 min',
      popular: true,
      description: 'light, crispy waffles topped with fresh berries and maple syrup.',
      image: 'https://images.unsplash.com/photo-1647209850142-f035ac0b22a8?q=80&w=435&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    }
  ],
  Fastfood: [
    {
      id: 6,
      name: 'Grilled Burger',
      price: 12.00,
      emoji: '🍔',
      prepTime: '15 min',
      popular: true,
      description: 'juicy beef patty with lettuce, tomato, cheese, and special sauce.',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 7,
      name: 'Margherita Pizza',
      price: 14.50,
      emoji: '🍕',
      prepTime: '20 min',
      popular: true,
      description: 'classic pizza with fresh mozzarella, basil, and tomato sauce.',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 8,
      name: 'Crispy French Fries',
      price: 4.99,
      emoji: '🍟',
      prepTime: '7 min',
      popular: false,
      description: 'golden and crispy salted potato fries.',
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 9,
      name: 'BBQ Chicken Wings',
      price: 9.99,
      emoji: '🍗',
      prepTime: '12 min',
      popular: false,
      description: 'tender chicken wings tossed in rich smoky BBQ sauce.',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=600&auto=format&fit=crop'
    }
  ],
  Seafood: [
    {
      id: 10,
      name: 'Grilled Salmon',
      price: 21.00,
      emoji: '🐟',
      prepTime: '18 min',
      popular: true,
      description: 'tender salmon fillet grilled with lemon butter sauce.',
      image: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 11,
      name: 'Garlic Butter Shrimp',
      price: 18.50,
      emoji: '🍤',
      prepTime: '14 min',
      popular: false,
      description: 'juicy shrimp cooked in garlic butter and white wine sauce.',
      image: 'https://images.unsplash.com/photo-1758972572427-fc3d4193bbd2?q=80&w=1376&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
      id: 12,
      name: 'Fish and Chips',
      price: 15.99,
      emoji: '🐟',
      prepTime: '15 min',
      popular: false,
      description: 'crispy battered cod served with a side of tartar sauce and chips.',
      image: 'https://plus.unsplash.com/premium_photo-1694108747175-889fdc786003?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
      id: 13,
      name: 'Seafood Paella',
      price: 24.99,
      emoji: '🥘',
      prepTime: '22 min',
      popular: true,
      description: 'flavorful saffron rice cooked with shrimp, mussels, and calamari.',
      image: 'https://images.unsplash.com/photo-1623961990059-28356e226a77?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    }
  ],
  Desserts: [
    {
      id: 14,
      name: 'Chocolate Lava Cake',
      price: 6.50,
      emoji: '🍫',
      prepTime: '10 min',
      popular: true,
      description: 'warm chocolate cake with a rich molten center.',
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 15,
      name: 'Cheesecake Slice',
      price: 5.80,
      emoji: '🍰',
      prepTime: '8 min',
      popular: false,
      description: 'creamy New York style cheesecake with a strawberry compote.',
      image: 'https://plus.unsplash.com/premium_photo-1701294050701-3c9e4cb1e43f?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
      id: 16,
      name: 'Ice Cream Sundae',
      price: 4.99,
      emoji: '🍨',
      prepTime: '5 min',
      popular: false,
      description: 'three scoops of vanilla, chocolate, and strawberry ice cream with chocolate syrup.',
      image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 17,
      name: 'Tiramisu Cup',
      price: 7.20,
      emoji: '☕',
      prepTime: '6 min',
      popular: true,
      description: 'classic Italian dessert with coffee-soaked ladyfingers and mascarpone.',
      image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=600&auto=format&fit=crop'
    }
  ]
};


export const MOCK_KITCHEN_ORDERS: KitchenOrder[] = [
  { id: 'K001', tableId: 7, items: [{ name: 'Grilled Burger', qty: 1 }, { name: 'Fresh Juice', qty: 2 }], status: 'new', createdAt: new Date(Date.now() - 2 * 60000), estimatedMinutes: 18 },
  { id: 'K002', tableId: 2, items: [{ name: 'Margherita Pizza', qty: 1 }, { name: 'Garlic Bread', qty: 2 }], status: 'cooking', createdAt: new Date(Date.now() - 12 * 60000), estimatedMinutes: 22 },
  { id: 'K003', tableId: 11, items: [{ name: 'Pasta Arrabiata', qty: 2 }, { name: 'Soft Drink', qty: 2 }], status: 'cooking', createdAt: new Date(Date.now() - 10 * 60000), estimatedMinutes: 15 },
  { id: 'K004', tableId: 3, items: [{ name: 'BBQ Ribs', qty: 1 }, { name: 'Mineral Water', qty: 1 }], status: 'ready', createdAt: new Date(Date.now() - 25 * 60000), estimatedMinutes: 25 },
  { id: 'K005', tableId: 3, items: [{ name: 'Cheesecake Slice', qty: 2 }], status: 'ready', createdAt: new Date(Date.now() - 8 * 60000), estimatedMinutes: 5 },
];

export const MOCK_RECENT_ORDERS = [
  { id: 'O001', tableId: 2, items: 4, status: 'in-progress', amount: 36.35, time: '10 min ago' },
  { id: 'O002', tableId: 3, items: 3, status: 'ready', amount: 25.98, time: '22 min ago' },
  { id: 'O003', tableId: 7, items: 6, status: 'in-progress', amount: 48.50, time: '5 min ago' },
  { id: 'O004', tableId: 11, items: 2, status: 'waiting', amount: 12.00, time: '15 min ago' },
  { id: 'O005', tableId: 4, items: 5, status: 'completed', amount: 39.80, time: '35 min ago' },
];
