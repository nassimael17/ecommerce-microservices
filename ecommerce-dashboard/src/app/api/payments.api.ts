import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Payment } from './api.models';

@Injectable({ providedIn: 'root' })
export class PaymentsApi {
  private base = '/api/payments';

  constructor(private http: HttpClient) {}

  list() { return this.http.get<Payment[]>(this.base); }

  create(p: { orderId: number; amount: number; method: string }) {
    return this.http.post<Payment>(this.base, p);
  }

  byOrder(orderId: number) {
    return this.http.get<Payment[]>(`${this.base}/by-order/${orderId}`);
  }
}
