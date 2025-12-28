import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from './api.models';

@Injectable({ providedIn: 'root' })
export class ProductsApi {
  private base = '/api/products';

  constructor(private http: HttpClient) { }

  list() { return this.http.get<Product[]>(this.base); }
  create(p: Product) { return this.http.post<Product>(this.base, p); }
  update(id: number, p: Product) { return this.http.put<Product>(`${this.base}/${id}`, p); }
  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}
