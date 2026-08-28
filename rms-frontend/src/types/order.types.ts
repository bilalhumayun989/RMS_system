import { MenuItem } from './menu.types';

export type OrderType = 'dine-in' | 'takeaway' | 'delivery';
export type OrderStatus = 'waiting' | 'in-progress' | 'ready' | 'completed';

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  tableId?: number;
  orderType: OrderType;
  items: CartItem[];
  status: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  createdAt: Date;
  time?: string;
}

export interface RecentOrder {
  id: string;
  tableId: number;
  items: number;
  status: string;
  amount: number;
  time: string;
}
