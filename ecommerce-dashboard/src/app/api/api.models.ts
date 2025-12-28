export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  available?: boolean;
}

export interface ChangePasswordRequest {
  password: string;
}

export interface Client {
  id?: number;
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
}

export type OrderStatus = 'PENDING' | 'CREATED' | 'PAID' | 'PAYMENT_FAILED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';

export interface Order {
  id?: number;
  clientId: number;
  productId: number;
  quantity: number;
  totalPrice?: number | null;
  status?: OrderStatus;
}

export interface NotificationMessage {
  id?: number;
  to?: string;
  subject?: string;
  text?: string;
  createdAt?: string;
}

export interface Payment {
  id?: number;
  orderId: number;
  amount: number;
  method: string;   // CARD/CASH/...
  status?: string;  // PAID/FAILED/...
  createdAt?: string;
  cardNumber?: string;
  cvv?: string;
  expiryDate?: string;
  ownerName?: string;
}
