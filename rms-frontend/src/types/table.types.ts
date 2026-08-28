export type TableStatus = 'available' | 'occupied' | 'served' | 'reserved';

export interface Table {
  id: number;
  seats: number;
  status: TableStatus;
  section: string;
  orderId?: string;
  amount?: number;
  duration?: number;
  reservedFor?: string;
  guestName?: string;
}
