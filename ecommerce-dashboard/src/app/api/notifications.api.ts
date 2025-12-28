import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationMessage } from './api.models';

@Injectable({ providedIn: 'root' })
export class NotificationsApi {
  private base = '/api/notifications';

  constructor(private http: HttpClient) {}

  list() { return this.http.get<NotificationMessage[]>(this.base); }
}
