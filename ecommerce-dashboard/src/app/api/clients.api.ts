import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client } from './api.models';

@Injectable({ providedIn: 'root' })
export class ClientsApi {
  private base = '/api/clients';

  constructor(private http: HttpClient) { }

  list() { return this.http.get<Client[]>(this.base); }
  create(c: Client) { return this.http.post<Client>(this.base, c); }
  update(id: number, c: Client) { return this.http.put<Client>(`${this.base}/${id}`, c); }
  updatePassword(id: number, p: string) { return this.http.patch<void>(`${this.base}/${id}/password`, { password: p }); }
  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}
