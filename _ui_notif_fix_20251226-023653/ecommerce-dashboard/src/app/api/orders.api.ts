import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order } from './api.models';

@Injectable({ providedIn: 'root' })
export class OrdersApi {
  private base = '/api/orders';

  constructor(private http: HttpClient) {}

  list() { return this.http.get<Order[]>(this.base); }
  create(o: Order) { return this.http.post<Order>(this.base, o); }
  updateStatus(id: number, status: string) {
    return this.http.put<Order>(`${this.base}/${id}/status`, { status });
  }
  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}
