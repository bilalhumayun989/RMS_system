export type KitchenStatus = 'new' | 'cooking' | 'ready';

export interface KitchenOrderItem {
  name: string;
  qty: number;
}

export interface KitchenOrder {
  id: string;
  tableId: number;
  items: KitchenOrderItem[];
  status: KitchenStatus;
  createdAt: Date;
  estimatedMinutes: number;
}
