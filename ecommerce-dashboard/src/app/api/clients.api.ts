import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client } from './api.models';

@Injectable({ providedIn: 'root' })
export class ClientsApi {
  private base = '/api/clients';

  constructor(private http: HttpClient) {}

  list() { return this.http.get<Client[]>(this.base); }
  create(c: Client) { return this.http.post<Client>(this.base, c); }
  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}
