import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Order } from './api.models';

@Injectable({ providedIn: 'root' })
export class OrdersApi {
  private base = '/api/orders';

  constructor(private http: HttpClient) { }

  list() { return this.http.get<Order[]>(this.base); }

  // ✅ match backend: POST /api/orders?productId=...&quantity=...
  create(productId: number, quantity: number, clientId: number) {
    const params = new HttpParams()
      .set('productId', String(productId))
      .set('quantity', String(quantity))
      .set('clientId', String(clientId));
    return this.http.post<Order>(this.base, null, { params });
  }

  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}
