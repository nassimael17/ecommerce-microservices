#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
FRONT="$ROOT/ecommerce-dashboard"

if [[ ! -d "$FRONT" ]]; then
  echo "❌ ecommerce-dashboard folder not found at: $FRONT"
  exit 1
fi

echo "==> ROOT: $ROOT"
echo "==> FRONT: $FRONT"

backup_dir="$ROOT/_ui_fix_backup_$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup_dir"
backup() {
  local f="$1"
  if [[ -f "$f" ]]; then
    mkdir -p "$backup_dir/$(dirname "$f")"
    cp -a "$f" "$backup_dir/$f"
  fi
}

ensure_dir() { mkdir -p "$1"; }

# -------------------------------------------------------------------
# 1) Ensure API models include Payment
# -------------------------------------------------------------------
MODELS="$FRONT/src/app/api/api.models.ts"
if [[ -f "$MODELS" ]]; then
  backup "${MODELS#"$ROOT/"}"
  if ! grep -q "export interface Payment" "$MODELS"; then
    cat >> "$MODELS" <<'TS'

export interface Payment {
  id?: number;
  orderId: number;
  amount: number;
  method: string;   // CARD/CASH/...
  status?: string;  // PAID/FAILED/...
  createdAt?: string;
}
TS
    echo "✅ Added Payment model"
  else
    echo "ℹ️ Payment model already present"
  fi
else
  echo "⚠️ api.models.ts not found, skipped"
fi

# -------------------------------------------------------------------
# 2) Add payments.api.ts
# -------------------------------------------------------------------
PAY_API="$FRONT/src/app/api/payments.api.ts"
backup "${PAY_API#"$ROOT/"}" || true
cat > "$PAY_API" <<'TS'
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
TS
echo "✅ payments.api.ts written"

# -------------------------------------------------------------------
# 3) Patch Orders page: replace ID inputs with dropdowns
# -------------------------------------------------------------------
ORDERS="$FRONT/src/app/ui/orders/orders.component.ts"
if [[ -f "$ORDERS" ]]; then
  backup "${ORDERS#"$ROOT/"}"

  cat > "$ORDERS" <<'TS'
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OrdersApi } from '../../api/orders.api';
import { ClientsApi } from '../../api/clients.api';
import { ProductsApi } from '../../api/products.api';

import { Client, Order, Product } from '../../api/api.models';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  standalone: true,
  selector: 'app-orders',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
  <mat-card class="card">
    <div style="padding:16px; display:flex; gap:12px; flex-wrap:wrap; align-items:end;">
      <h2 style="margin:0; flex:1 1 auto;">Commandes</h2>

      <mat-form-field appearance="outline" style="min-width:260px;">
        <mat-label>Client</mat-label>
        <mat-select [(ngModel)]="clientId">
          <ng-container *ngFor="let c of clients()">
            <mat-option [value]="c.id">{{ c.fullName }} — {{ c.email }} (id={{c.id}})</mat-option>
          </ng-container>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" style="min-width:260px;">
        <mat-label>Produit</mat-label>
        <mat-select [(ngModel)]="productId">
          <ng-container *ngFor="let p of products()">
            <mat-option [value]="p.id">{{ p.name }} — {{ p.price }} MAD (id={{p.id}})</mat-option>
          </ng-container>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" style="width:140px;">
        <mat-label>Quantité</mat-label>
        <input matInput type="number" min="1" [(ngModel)]="quantity">
      </mat-form-field>

      <button mat-raised-button (click)="create()" [disabled]="!clientId || !productId || quantity<1">Créer</button>
      <button mat-button (click)="refresh()">Rafraîchir</button>
    </div>

    <div style="padding:0 16px 16px 16px;">
      <div *ngIf="items().length===0" style="opacity:.7;">Aucune commande (ou API non dispo).</div>

      <div *ngFor="let o of items()" style="display:flex; justify-content:space-between; padding:12px 0; border-top:1px solid #eee; gap:12px; align-items:center;">
        <div style="min-width:0;">
          <div style="font-weight:600;">Commande #{{ o.id }}</div>
          <div style="opacity:.75; font-size:13px;">
            clientId={{o.clientId}} • productId={{o.productId}} • qty={{o.quantity}} • status={{o.status}}
          </div>
        </div>

        <div style="display:flex; gap:8px;">
          <button mat-stroked-button (click)="ship(o)" [disabled]="!o.id">Marquer SHIPPED</button>
        </div>
      </div>
    </div>
  </mat-card>
  `,
})
export class OrdersComponent {
  private ordersApi = new OrdersApi();
  private clientsApi = new ClientsApi();
  private productsApi = new ProductsApi();

  items = signal<Order[]>([]);
  clients = signal<Client[]>([]);
  products = signal<Product[]>([]);

  clientId: number | null = null;
  productId: number | null = null;
  quantity = 1;

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.ordersApi.list().subscribe({ next: (d) => this.items.set(d ?? []), error: () => this.items.set([]) });

    this.clientsApi.list().subscribe({
      next: (d) => {
        const list = d ?? [];
        this.clients.set(list);
        if (!this.clientId && list.length) this.clientId = list[0].id ?? null;
      },
      error: () => this.clients.set([]),
    });

    this.productsApi.list().subscribe({
      next: (d) => {
        const list = d ?? [];
        this.products.set(list);
        if (!this.productId && list.length) this.productId = list[0].id ?? null;
      },
      error: () => this.products.set([]),
    });
  }

  create() {
    if (!this.clientId || !this.productId) return;
    this.ordersApi.create({ clientId: Number(this.clientId), productId: Number(this.productId), quantity: Number(this.quantity) })
      .subscribe({ next: () => this.refresh() });
  }

  ship(o: Order) {
    if (!o.id) return;
    this.ordersApi.updateStatus(o.id, 'SHIPPED').subscribe({ next: () => this.refresh() });
  }
}
TS

  echo "✅ Orders page upgraded: dropdown selects for clients/products"
else
  echo "⚠️ Orders component not found, skipped"
fi

# -------------------------------------------------------------------
# 4) Add Payments page component
# -------------------------------------------------------------------
PAY_DIR="$FRONT/src/app/ui/payments"
ensure_dir "$PAY_DIR"

PAY_COMP="$PAY_DIR/payments.component.ts"
backup "${PAY_COMP#"$ROOT/"}" || true
cat > "$PAY_COMP" <<'TS'
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PaymentsApi } from '../../api/payments.api';
import { OrdersApi } from '../../api/orders.api';
import { Payment, Order } from '../../api/api.models';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  standalone: true,
  selector: 'app-payments',
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
  <mat-card class="card">
    <div style="padding:16px; display:flex; gap:12px; flex-wrap:wrap; align-items:end;">
      <h2 style="margin:0; flex:1 1 auto;">Paiements</h2>

      <mat-form-field appearance="outline" style="min-width:260px;">
        <mat-label>Commande</mat-label>
        <mat-select [(ngModel)]="orderId">
          <ng-container *ngFor="let o of orders()">
            <mat-option [value]="o.id">Commande #{{o.id}} — status={{o.status}} (id={{o.id}})</mat-option>
          </ng-container>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" style="width:160px;">
        <mat-label>Montant</mat-label>
        <input matInput type="number" min="0" [(ngModel)]="amount">
      </mat-form-field>

      <mat-form-field appearance="outline" style="width:160px;">
        <mat-label>Méthode</mat-label>
        <mat-select [(ngModel)]="method">
          <mat-option value="CARD">CARD</mat-option>
          <mat-option value="CASH">CASH</mat-option>
          <mat-option value="TRANSFER">TRANSFER</mat-option>
        </mat-select>
      </mat-form-field>

      <button mat-raised-button (click)="create()" [disabled]="!orderId || amount<=0">Créer</button>
      <button mat-button (click)="load()">Rafraîchir</button>
    </div>

    <div style="padding:0 16px 16px 16px;">
      <div *ngIf="items().length===0" style="opacity:.7;">Aucun paiement (ou API non dispo).</div>

      <div *ngFor="let p of items()" style="display:flex; justify-content:space-between; padding:12px 0; border-top:1px solid #eee; gap:12px; align-items:center;">
        <div style="min-width:0;">
          <div style="font-weight:600;">Paiement #{{ p.id }}</div>
          <div style="opacity:.75; font-size:13px;">
            orderId={{p.orderId}} • {{p.amount}} • method={{p.method}} • status={{p.status}}
          </div>
        </div>
      </div>
    </div>
  </mat-card>
  `,
})
export class PaymentsComponent {
  private api = new PaymentsApi();
  private ordersApi = new OrdersApi();

  items = signal<Payment[]>([]);
  orders = signal<Order[]>([]);

  orderId: number | null = null;
  amount = 199.99;
  method = 'CARD';

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.list().subscribe({ next: (d) => this.items.set(d ?? []), error: () => this.items.set([]) });

    this.ordersApi.list().subscribe({
      next: (d) => {
        const list = d ?? [];
        this.orders.set(list);
        if (!this.orderId && list.length) this.orderId = list[0].id ?? null;
      },
      error: () => this.orders.set([]),
    });
  }

  create() {
    if (!this.orderId) return;
    this.api.create({ orderId: Number(this.orderId), amount: Number(this.amount), method: this.method })
      .subscribe({ next: () => this.load() });
  }
}
TS
echo "✅ Payments page added"

# -------------------------------------------------------------------
# 5) Patch app.routes.ts to include /app/payments
# -------------------------------------------------------------------
ROUTES="$FRONT/src/app/app.routes.ts"
if [[ -f "$ROUTES" ]]; then
  backup "${ROUTES#"$ROOT/"}"
  if ! grep -q "payments.component" "$ROUTES"; then
    # insert import + route (simple + safe)
    python3 - <<'PY'
from pathlib import Path
p = Path("ecommerce-dashboard/src/app/app.routes.ts")
txt = p.read_text()

# Add lazy import block like other routes (best-effort)
if "path: 'payments'" not in txt:
  # Insert route inside children of /app if pattern exists
  marker = "children: ["
  if marker in txt:
    parts = txt.split(marker, 1)
    head, rest = parts[0], parts[1]
    inject_route = """children: [
      { path: 'payments', loadComponent: () => import('./ui/payments/payments.component').then(m => m.PaymentsComponent) },
"""
    txt = head + inject_route + rest
p.write_text(txt)
print("✅ app.routes.ts patched with payments route")
PY
  else
    echo "ℹ️ payments route already present"
  fi
else
  echo "⚠️ app.routes.ts not found, skipped"
fi

# -------------------------------------------------------------------
# 6) Patch Shell sidebar to add Payments menu item
# -------------------------------------------------------------------
SHELL="$FRONT/src/app/ui/layout/shell.component.ts"
if [[ -f "$SHELL" ]]; then
  backup "${SHELL#"$ROOT/"}"
  if ! grep -q "Paiements" "$SHELL"; then
    python3 - <<'PY'
from pathlib import Path
p = Path("ecommerce-dashboard/src/app/ui/layout/shell.component.ts")
txt = p.read_text()

# Add a new nav item near others (best effort, doesn't break if template differs)
# Insert after "Commandes" if present
needle = "Commandes"
if needle in txt and "Paiements" not in txt:
  txt = txt.replace(needle, needle + "\\n    <a class=\\"nav\\" routerLink=\\"/app/payments\\">💳 Paiements</a>")

p.write_text(txt)
print("✅ shell.component.ts sidebar patched (Paiements)")
PY
  else
    echo "ℹ️ Sidebar already contains Paiements"
  fi
else
  echo "⚠️ shell.component.ts not found, skipped"
fi

# -------------------------------------------------------------------
# 7) Make Notifications page auto-refresh (poll)
# -------------------------------------------------------------------
NOTIF="$FRONT/src/app/ui/notifications/notifications.component.ts"
if [[ -f "$NOTIF" ]]; then
  backup "${NOTIF#"$ROOT/"}"

  # If it already has polling, skip. Otherwise patch a simple polling loop.
  if ! grep -q "setInterval" "$NOTIF"; then
    python3 - <<'PY'
from pathlib import Path
p = Path("ecommerce-dashboard/src/app/ui/notifications/notifications.component.ts")
txt = p.read_text()

# add polling inside ngOnInit if exists, else add ngOnInit
if "ngOnInit()" in txt and "setInterval" not in txt:
  txt = txt.replace("ngOnInit() {", "ngOnInit() {\n    this.load();\n    setInterval(() => this.load(), 2000);\n")
elif "export class" in txt and "setInterval" not in txt:
  # add a minimal ngOnInit (best effort)
  txt = txt.replace("{", "{\n  ngOnInit() {\n    this.load();\n    setInterval(() => this.load(), 2000);\n  }\n", 1)

p.write_text(txt)
print("✅ notifications.component.ts patched with polling (2s)")
PY
  else
    echo "ℹ️ Notifications already polling"
  fi
else
  echo "⚠️ notifications.component.ts not found, skipped"
fi

echo
echo "====================================================="
echo "✅ FRONTEND UI FIX APPLIED"
echo "Backup saved at: $backup_dir"
echo
echo "Now run:"
echo "  cd ecommerce-dashboard"
echo "  npm install"
echo "  npm start"
echo "====================================================="
