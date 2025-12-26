export interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  stock?: number;
}

export interface Client {
  id?: number;
  fullName: string;
  email: string;
  phone?: string;
}

export type OrderStatus = 'CREATED' | 'PAID' | 'SHIPPED' | 'CANCELLED';

export interface Order {
  id?: number;
  clientId: number;
  productId: number;
  quantity: number;
  status?: OrderStatus;
}

export interface NotificationMessage {
  id?: number;
  to?: string;
  subject?: string;
  text?: string;
  createdAt?: string;
}
