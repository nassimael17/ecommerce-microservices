#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ts(){ date +"%Y%m%d-%H%M%S"; }
BACKUP="$ROOT/_ui_notif_fix_$(ts)"
mkdir -p "$BACKUP"

echo "==> ROOT: $ROOT"
echo "==> BACKUP: $BACKUP"

backup() {
  local f="$1"
  if [[ -f "$f" ]]; then
    mkdir -p "$BACKUP/$(dirname "$f")"
    cp -a "$f" "$BACKUP/$f"
  fi
}

need_file() {
  local f="$1"
  if [[ ! -f "$f" ]]; then
    echo "❌ Missing file: $f"
    exit 1
  fi
}

# ---------------------------
# Paths (based on your tree)
# ---------------------------
FRONT="$ROOT/ecommerce-dashboard"
ORDERS_COMP="$FRONT/src/app/ui/orders/orders.component.ts"
SHELL_COMP="$FRONT/src/app/ui/layout/shell.component.ts"
APP_ROUTES="$FRONT/src/app/app.routes.ts"
API_MODELS="$FRONT/src/app/api/api.models.ts"
ORDERS_API="$FRONT/src/app/api/orders.api.ts"
PRODUCTS_API="$FRONT/src/app/api/products.api.ts"
CLIENTS_API="$FRONT/src/app/api/clients.api.ts"
NOTIFS_API="$FRONT/src/app/api/notifications.api.ts"

PAYMENTS_API="$FRONT/src/app/api/payments.api.ts"
PAYMENTS_COMP_DIR="$FRONT/src/app/ui/payments"
PAYMENTS_COMP="$PAYMENTS_COMP_DIR/payments.component.ts"

# notification-service backend
NOTIF_SVC="$ROOT/notification-service/notification-service"
NOTIF_APP_YML="$NOTIF_SVC/src/main/resources/application.yml"
NOTIF_LISTENER="$NOTIF_SVC/src/main/java/com/ecommerce/notification/service/listener/NotificationListener.java"
NOTIF_MODEL="$NOTIF_SVC/src/main/java/com/ecommerce/notification/service/model/NotificationMessage.java"
NOTIF_STORE="$NOTIF_SVC/src/main/java/com/ecommerce/notification/service/store/NotificationStore.java"
NOTIF_CTRL="$NOTIF_SVC/src/main/java/com/ecommerce/notification/service/controller/NotificationController.java"

echo "==> Checking required frontend files..."
need_file "$ORDERS_COMP"
need_file "$SHELL_COMP"
need_file "$APP_ROUTES"
need_file "$API_MODELS"
need_file "$ORDERS_API"
need_file "$CLIENTS_API"
need_file "$PRODUCTS_API"
need_file "$NOTIFS_API"

# ============================================================
# 1) FRONTEND: add Payment model + payments.api.ts
# ============================================================
echo "==> FRONTEND: Adding Payment model + Payments API/page..."

backup "${API_MODELS#"$ROOT/"}"

# Add Payment interface if missing
python3 - <<PY
from pathlib import Path

p = Path("$API_MODELS")
txt = p.read_text(encoding="utf-8")

if "export interface Payment" not in txt:
    txt += """

export interface Payment {
  id?: number;
  orderId: number;
  amount: number;
  method: string;   // CARD/CASH/...
  status?: string;  // PAID/FAILED/...
  createdAt?: string;
}
"""
    p.write_text(txt, encoding="utf-8")
    print("✅ Payment model added to api.models.ts")
else:
    print("ℹ️ Payment model already exists")
PY
 

# Write payments.api.ts
mkdir -p "$(dirname "$PAYMENTS_API")"
backup "${PAYMENTS_API#"$ROOT/"}" || true
cat > "$PAYMENTS_API" <<'TS'
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
TS
echo "✅ payments.api.ts written"

# ============================================================
# 2) FRONTEND: Fix OrdersApi to match your backend
#    Backend is: POST /api/orders?productId=...&quantity=...
# ============================================================
backup "${ORDERS_API#"$ROOT/"}"
cat > "$ORDERS_API" <<'TS'
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Order } from './api.models';

@Injectable({ providedIn: 'root' })
export class OrdersApi {
  private base = '/api/orders';

  constructor(private http: HttpClient) {}

  list() { return this.http.get<Order[]>(this.base); }

  // ✅ match backend: POST /api/orders?productId=...&quantity=...
  create(productId: number, quantity: number) {
    const params = new HttpParams()
      .set('productId', String(productId))
      .set('quantity', String(quantity));
    return this.http.post<Order>(this.base, null, { params });
  }

  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}
TS
echo "✅ OrdersApi fixed (query params) to match backend"

# ============================================================
# 3) FRONTEND: Orders page dropdown selects for clients/products
# ============================================================
backup "${ORDERS_COMP#"$ROOT/"}"

cat > "$ORDERS_COMP" <<'TS'
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OrdersApi } from '../../api/orders.api';
import { ClientsApi } from '../../api/clients.api';
import { ProductsApi } from '../../api/products.api';

import { Order, Client, Product } from '../../api/api.models';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  standalone: true,
  selector: 'app-orders',
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule
  ],
  template: `
  <mat-card class="card">
    <div style="padding:16px; display:flex; gap:12px; flex-wrap:wrap; align-items:end;">
      <h2 style="margin:0; flex:1 1 auto;">Commandes</h2>

      <!-- ✅ Client dropdown (for UX) -->
      <mat-form-field appearance="outline" style="min-width:220px;">
        <mat-label>Client</mat-label>
        <mat-select [(ngModel)]="selectedClientId">
          <mat-option *ngFor="let c of clients()" [value]="c.id">
            {{ c.fullName }} ({{ c.email }}) - #{{ c.id }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <!-- ✅ Product dropdown -->
      <mat-form-field appearance="outline" style="min-width:260px;">
        <mat-label>Produit</mat-label>
        <mat-select [(ngModel)]="selectedProductId">
          <mat-option *ngFor="let p of products()" [value]="p.id">
            {{ p.name }} - {{ p.price }} MAD - Stock: {{ p.quantity }} (#{{ p.id }})
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" style="width:140px;">
        <mat-label>Quantité</mat-label>
        <input matInput type="number" min="1" [(ngModel)]="quantity">
      </mat-form-field>

      <button mat-raised-button (click)="add()" [disabled]="!selectedProductId">Créer</button>
      <button mat-button (click)="reloadAll()">Rafraîchir</button>
    </div>

    <div style="padding:0 16px 16px 16px;">
      <div *ngIf="items().length===0" style="opacity:.7;">Aucune commande (ou API non dispo).</div>

      <div *ngFor="let o of items()" style="display:flex; justify-content:space-between; padding:12px 0; border-top:1px solid #eee;">
        <div>
          <div style="font-weight:600;">Order #{{ o.id ?? '—' }}</div>
          <div style="opacity:.7;">
            productId={{ o.productId }}, qty={{ o.quantity }}, status={{ o.status ?? '—' }},
            total={{ o.totalPrice ?? '—' }}
          </div>
        </div>
        <button mat-stroked-button color="warn" (click)="remove(o)" [disabled]="!o.id">Delete</button>
      </div>
    </div>
  </mat-card>
  `
})
export class OrdersComponent {
  items = signal<Order[]>([]);
  clients = signal<Client[]>([]);
  products = signal<Product[]>([]);

  selectedClientId: number | null = null;   // UX only for now
  selectedProductId: number | null = null;

  quantity = 1;

  constructor(
    private ordersApi: OrdersApi,
    private clientsApi: ClientsApi,
    private productsApi: ProductsApi
  ) {
    this.reloadAll();
  }

  reloadAll() {
    this.loadOrders();
    this.loadClients();
    this.loadProducts();
  }

  loadOrders() {
    this.ordersApi.list().subscribe({ next: v => this.items.set(v), error: () => this.items.set([]) });
  }

  loadClients() {
    this.clientsApi.list().subscribe({ next: v => {
      this.clients.set(v);
      if (this.selectedClientId == null && v.length) this.selectedClientId = v[0].id ?? null;
    }, error: () => this.clients.set([]) });
  }

  loadProducts() {
    this.productsApi.list().subscribe({ next: v => {
      this.products.set(v);
      if (this.selectedProductId == null && v.length) this.selectedProductId = v[0].id ?? null;
    }, error: () => this.products.set([]) });
  }

  add() {
    if (!this.selectedProductId) return;
    const pid = Number(this.selectedProductId);
    const qty = Number(this.quantity || 1);

    // ✅ backend expects query params
    this.ordersApi.create(pid, qty).subscribe({
      next: () => this.loadOrders(),
      error: (e) => {
        console.error(e);
        alert("Erreur création commande (voir console).");
      }
    });
  }

  remove(o: Order) {
    if (!o.id) return;
    this.ordersApi.delete(o.id).subscribe({ next: () => this.loadOrders() });
  }
}
TS

echo "✅ Orders page upgraded with dropdown selects"

# ============================================================
# 4) FRONTEND: Add Payments page + route + sidebar link
# ============================================================
mkdir -p "$PAYMENTS_COMP_DIR"
backup "${PAYMENTS_COMP#"$ROOT/"}" || true

cat > "$PAYMENTS_COMP" <<'TS'
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { PaymentsApi } from '../../api/payments.api';
import { Payment } from '../../api/api.models';

@Component({
  standalone: true,
  selector: 'app-payments',
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
  <mat-card class="card">
    <div style="padding:16px; display:flex; gap:12px; flex-wrap:wrap; align-items:end;">
      <h2 style="margin:0; flex:1 1 auto;">Paiements</h2>

      <mat-form-field appearance="outline" style="width:140px;">
        <mat-label>Order ID</mat-label>
        <input matInput type="number" [(ngModel)]="orderId">
      </mat-form-field>

      <mat-form-field appearance="outline" style="width:160px;">
        <mat-label>Amount</mat-label>
        <input matInput type="number" [(ngModel)]="amount">
      </mat-form-field>

      <mat-form-field appearance="outline" style="width:180px;">
        <mat-label>Method</mat-label>
        <input matInput [(ngModel)]="method" placeholder="CARD / CASH">
      </mat-form-field>

      <button mat-raised-button (click)="pay()">Payer</button>
      <button mat-button (click)="load()">Rafraîchir</button>
    </div>

    <div style="padding:0 16px 16px 16px;">
      <div *ngIf="items().length===0" style="opacity:.7;">Aucun paiement.</div>

      <div *ngFor="let p of items()" style="display:flex; justify-content:space-between; padding:12px 0; border-top:1px solid #eee;">
        <div>
          <div style="font-weight:600;">Payment #{{ p.id ?? '—' }} ({{ p.status ?? '—' }})</div>
          <div style="opacity:.7;">orderId={{ p.orderId }}, amount={{ p.amount }}, method={{ p.method }}, at={{ p.createdAt ?? '—' }}</div>
        </div>
      </div>
    </div>
  </mat-card>
  `
})
export class PaymentsComponent {
  items = signal<Payment[]>([]);
  orderId = 1;
  amount = 0;
  method = 'CARD';

  constructor(private api: PaymentsApi) { this.load(); }

  load() {
    this.api.list().subscribe({ next: v => this.items.set(v), error: () => this.items.set([]) });
  }

  pay() {
    this.api.create({ orderId: Number(this.orderId), amount: Number(this.amount), method: this.method })
      .subscribe({ next: () => this.load() });
  }
}
TS
echo "✅ Payments page added"

# Patch app.routes.ts: add payments route if missing
backup "${APP_ROUTES#"$ROOT/"}"

python3 - <<PY
from pathlib import Path
p = Path("$APP_ROUTES")
txt = p.read_text(encoding="utf-8")

if "PaymentsComponent" not in txt:
    # add import near other UI imports
    txt = txt.replace(
        "import { NotificationsComponent } from './ui/notifications/notifications.component';",
        "import { NotificationsComponent } from './ui/notifications/notifications.component';\nimport { PaymentsComponent } from './ui/payments/payments.component';"
    )

if "path: 'payments'" not in txt:
    txt = txt.replace(
        "{ path: 'notifications', component: NotificationsComponent }",
        "{ path: 'notifications', component: NotificationsComponent },\n      { path: 'payments', component: PaymentsComponent }"
    )

p.write_text(txt, encoding="utf-8")
print("✅ app.routes.ts patched with payments route")
PY

# Patch sidebar in shell.component.ts (NO python escaping issues)
backup "${SHELL_COMP#"$ROOT/"}"

python3 - <<PY
from pathlib import Path
p = Path("$SHELL_COMP")
txt = p.read_text(encoding="utf-8")

if "/app/payments" not in txt:
    insert_after = """
        <a mat-list-item routerLink="/app/orders" routerLinkActive="active">
          <mat-icon>shopping_cart</mat-icon>
          <span style="margin-left:8px;">Commandes</span>
        </a>
"""
    payments_block = """
        <a mat-list-item routerLink="/app/payments" routerLinkActive="active">
          <mat-icon>payments</mat-icon>
          <span style="margin-left:8px;">Paiements</span>
        </a>
"""
    if insert_after in txt:
        txt = txt.replace(insert_after, insert_after + payments_block)
    else:
        # fallback: add before clients
        txt = txt.replace(
            '<a mat-list-item routerLink="/app/clients" routerLinkActive="active">',
            payments_block + '\n        <a mat-list-item routerLink="/app/clients" routerLinkActive="active">'
        )

p.write_text(txt, encoding="utf-8")
print("✅ Sidebar patched with payments link")
PY

# ============================================================
# 5) BACKEND: RabbitMQ Notifications consumer + REST API
# ============================================================
echo "==> BACKEND: Fixing notification-service (RabbitMQ consumer + /api/notifications)..."

# Ensure folders
mkdir -p "$(dirname "$NOTIF_LISTENER")" "$(dirname "$NOTIF_MODEL")" "$(dirname "$NOTIF_STORE")" "$(dirname "$NOTIF_CTRL")"
backup "${NOTIF_APP_YML#"$ROOT/"}" || true

# NotificationMessage model (simple)
cat > "$NOTIF_MODEL" <<'JAVA'
package com.ecommerce.notification.service.model;

import java.util.List;

public class NotificationMessage {
  private List<String> to;
  private String phone;
  private String message;

  public NotificationMessage() {}

  public NotificationMessage(List<String> to, String phone, String message) {
    this.to = to;
    this.phone = phone;
    this.message = message;
  }

  public List<String> getTo() { return to; }
  public void setTo(List<String> to) { this.to = to; }

  public String getPhone() { return phone; }
  public void setPhone(String phone) { this.phone = phone; }

  public String getMessage() { return message; }
  public void setMessage(String message) { this.message = message; }
}
JAVA

# In-memory store
cat > "$NOTIF_STORE" <<'JAVA'
package com.ecommerce.notification.service.store;

import com.ecommerce.notification.service.model.NotificationMessage;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class NotificationStore {

  public static class Item {
    public String subject;
    public String message;
    public List<String> to;
    public String phone;
    public String createdAt;

    public Item() {}

    public Item(String subject, String message, List<String> to, String phone) {
      this.subject = subject;
      this.message = message;
      this.to = to;
      this.phone = phone;
      this.createdAt = Instant.now().toString();
    }
  }

  private final List<Item> items = Collections.synchronizedList(new ArrayList<>());

  public void add(Item i) {
    items.add(0, i); // newest first
    if (items.size() > 200) items.remove(items.size() - 1);
  }

  public List<Item> all() {
    return new ArrayList<>(items);
  }
}
JAVA

# Listener that consumes RabbitMQ + stores + logs
cat > "$NOTIF_LISTENER" <<'JAVA'
package com.ecommerce.notification.service.listener;

import com.ecommerce.notification.service.config.RabbitMQConfig;
import com.ecommerce.notification.service.model.NotificationMessage;
import com.ecommerce.notification.service.store.NotificationStore;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationListener {

  private final NotificationStore store;

  public NotificationListener(NotificationStore store) {
    this.store = store;
  }

  @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME, containerFactory = "rabbitListenerContainerFactory")
  public void onMessage(NotificationMessage msg) {
    String subject = "Notification";
    String text = msg != null ? msg.getMessage() : "(empty)";
    System.out.println("📥 Notification received: " + text);

    store.add(new NotificationStore.Item(subject, text,
      msg != null ? msg.getTo() : null,
      msg != null ? msg.getPhone() : null
    ));
  }
}
JAVA

# REST controller for Angular: GET /api/notifications
cat > "$NOTIF_CTRL" <<'JAVA'
package com.ecommerce.notification.service.controller;

import com.ecommerce.notification.service.store.NotificationStore;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

  private final NotificationStore store;

  public NotificationController(NotificationStore store) {
    this.store = store;
  }

  @GetMapping
  public List<NotificationStore.Item> all() {
    return store.all();
  }
}
JAVA

# Fix notification-service application.yml (enable eureka + rabbit)
python3 - <<'PY'
from pathlib import Path
p = Path("notification-service/notification-service/src/main/resources/application.yml")
if not p.exists():
    print("⚠️ notification-service application.yml not found, skipped.")
    raise SystemExit(0)

txt = p.read_text(encoding="utf-8")

# Ensure rabbitmq config exists (keep user's values if already there)
if "spring:\n" not in txt:
    txt = "spring:\n" + txt

# Enable eureka so gateway can route via lb://notification-service
if "eureka:" in txt:
    # remove the old "enabled: false" if present
    txt = txt.replace("enabled: false", "enabled: true")
else:
    txt += """

eureka:
  client:
    serviceUrl:
      defaultZone: http://eureka-server:8761/eureka/
  instance:
    preferIpAddress: true
"""

# Also ensure the app name stays correct
if "name: notification-service" not in txt:
    txt = txt.replace("spring:\n", "spring:\n  application:\n    name: notification-service\n")

p.write_text(txt, encoding="utf-8")
print("✅ notification-service application.yml patched (eureka enabled)")
PY

echo ""
echo "============================================================"
echo "✅ FIX DONE"
echo ""
echo "NOW DO THIS (exact order):"
echo "1) Rebuild backend:"
echo "   docker compose down -v"
echo "   docker compose up -d --build"
echo ""
echo "2) Test notifications quickly:"
echo "   curl -s -X POST 'http://localhost:8085/api/orders?productId=1&quantity=1'"
echo "   curl -s http://localhost:8085/api/notifications | jq ."
echo ""
echo "3) Start frontend:"
echo "   cd ecommerce-dashboard"
echo "   npm install"
echo "   npm start"
echo "============================================================"
