export interface Supply {
  id: number;
  name: string;
  unit: string;
  quantity: number;
  min_quantity: number;
  unit_cost?: number;
  supplier?: string;
  category: string;
  notes?: string;
  is_active: boolean;
  low_stock: boolean;
}

export interface SupplyLog {
  id: number;
  supply_id: number;
  type: 'purchase' | 'usage' | 'adjustment';
  quantity: number;
  unit_cost?: number;
  date: string;
  notes?: string;
}
