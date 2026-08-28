export type PaymentMethodType = 'cash' | 'card' | 'split';

export interface PaymentDetails {
  method: PaymentMethodType;
  amountPaid: number;
  changeDue?: number;
  cardNumber?: string;
  splitCount?: number;
  amountPerPerson?: number;
}
