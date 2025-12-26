import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Payment } from './api.models';

@Injectable({ providedIn: 'root' })
export class PaymentsApi {
  private http = inject(HttpClient);

  list() {
    return this.http.get<Payment[]>('/api/payments');
  }

  byOrder(orderId: number) {
    return this.http.get<Payment[]>(`/api/payments/by-order/${orderId}`);
  }

  create(p: { orderId: number; amount: number; method: string }) {
    return this.http.post<Payment>('/api/payments', p);
  }
}
