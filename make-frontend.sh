#!/usr/bin/env bash
set -euo pipefail

APP_DIR="ecommerce-dashboard"
APP_NAME="ecommerce-dashboard"

# Change this if your gateway is on another port (8085 etc.)
GATEWAY_URL="${GATEWAY_URL:-http://localhost:8080}"

need_cmd() { command -v "$1" >/dev/null 2>&1 || { echo "❌ Missing: $1"; exit 1; }; }

need_cmd node
need_cmd npm

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "❌ Node >= 18 required. You have: $(node -v)"
  exit 1
fi

echo "✅ Node: $(node -v) | npm: $(npm -v)"
echo "✅ Gateway target: $GATEWAY_URL"

if [ ! -d "$APP_DIR" ]; then
  echo "📦 Creating Angular app: $APP_DIR"
  npx -y @angular/cli@21 new "$APP_DIR" \
    --standalone \
    --routing \
    --style=scss \
    --ssr=false \
    --skip-tests
else
  echo "ℹ️  $APP_DIR already exists, skipping creation."
fi

cd "$APP_DIR"

echo "📦 Installing dependencies..."
npm i

echo "🎨 Installing Angular Material..."
npm i @angular/material @angular/cdk @angular/animations

# Proxy to Gateway
cat > proxy.conf.json <<EOF
{
  "/api": {
    "target": "$GATEWAY_URL",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
EOF

# Styles (simple + clean)
cat > src/styles.scss <<'EOF'
@import "@angular/material/prebuilt-themes/indigo-pink.css";

html, body { height: 100%; }
body { margin: 0; font-family: Roboto, "Helvetica Neue", sans-serif; background: #f6f7fb; }
.container { padding: 16px; }
.card { border-radius: 16px; }
EOF

# ===== Core Auth (fake now) =====
mkdir -p src/app/core/{auth,guards,http}

cat > src/app/core/auth/auth.models.ts <<'EOF'
export type Role = 'ADMIN' | 'USER';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  email: string;
  role: Role;
  token: string; // fake token for now
}
EOF

cat > src/app/core/auth/auth.service.ts <<'EOF'
import { Injectable, signal, computed } from '@angular/core';
import { AuthUser, LoginRequest, Role } from './auth.models';

const STORAGE_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<AuthUser | null>(this.readFromStorage());

  user = computed(() => this._user());
  isLoggedIn = computed(() => !!this._user());

  login(payload: LoginRequest) {
    // Fake auth for now (until you implement real auth in backend)
    // Rule: if email contains "admin" => ADMIN else USER
    const role: Role = payload.email.toLowerCase().includes('admin') ? 'ADMIN' : 'USER';

    const user: AuthUser = {
      email: payload.email.trim(),
      role,
      token: 'fake-jwt-token'
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  logout() {
    localStorage.removeItem(STORAGE_KEY);
    this._user.set(null);
  }

  hasRole(roles: Role[]) {
    const u = this._user();
    return !!u && roles.includes(u.role);
  }

  private readFromStorage(): AuthUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
EOF

cat > src/app/core/guards/auth.guard.ts <<'EOF'
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  router.navigateByUrl('/login');
  return false;
};
EOF

cat > src/app/core/guards/role.guard.ts <<'EOF'
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Role } from '../auth/auth.models';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = (route.data['roles'] ?? []) as Role[];

  if (!auth.isLoggedIn()) {
    router.navigateByUrl('/login');
    return false;
  }
  if (!roles.length || auth.hasRole(roles)) return true;

  router.navigateByUrl('/app/dashboard');
  return false;
};
EOF

# ===== API services =====
mkdir -p src/app/api

cat > src/app/api/api.models.ts <<'EOF'
export interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  stock?: number;
}

export interface Client {
  id?: number;
  fullName: string;
  email: string;
  phone?: string;
}

export type OrderStatus = 'CREATED' | 'PAID' | 'SHIPPED' | 'CANCELLED';

export interface Order {
  id?: number;
  clientId: number;
  productId: number;
  quantity: number;
  status?: OrderStatus;
}

export interface NotificationMessage {
  id?: number;
  to?: string;
  subject?: string;
  text?: string;
  createdAt?: string;
}
EOF

cat > src/app/api/products.api.ts <<'EOF'
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from './api.models';

@Injectable({ providedIn: 'root' })
export class ProductsApi {
  private base = '/api/products';

  constructor(private http: HttpClient) {}

  list() { return this.http.get<Product[]>(this.base); }
  create(p: Product) { return this.http.post<Product>(this.base, p); }
  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}
EOF

cat > src/app/api/clients.api.ts <<'EOF'
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
EOF

cat > src/app/api/orders.api.ts <<'EOF'
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
EOF

cat > src/app/api/notifications.api.ts <<'EOF'
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationMessage } from './api.models';

@Injectable({ providedIn: 'root' })
export class NotificationsApi {
  private base = '/api/notifications';

  constructor(private http: HttpClient) {}

  list() { return this.http.get<NotificationMessage[]>(this.base); }
}
EOF

# ===== UI: layout + pages =====
mkdir -p src/app/ui/{layout,login,dashboard,products,orders,clients,notifications}

cat > src/app/ui/layout/shell.component.ts <<'EOF'
import { Component, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-shell',
  imports: [
    CommonModule,
    RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatIconModule, MatListModule, MatButtonModule
  ],
  template: `
  <mat-sidenav-container style="height:100vh">
    <mat-sidenav mode="side" opened>
      <div style="padding:16px; font-weight:700;">Ecommerce Admin</div>

      <mat-nav-list>
        <a mat-list-item routerLink="/app/dashboard" routerLinkActive="active">
          <mat-icon>dashboard</mat-icon>
          <span style="margin-left:8px;">Dashboard</span>
        </a>

        <a mat-list-item routerLink="/app/products" routerLinkActive="active">
          <mat-icon>inventory_2</mat-icon>
          <span style="margin-left:8px;">Produits</span>
        </a>

        <a mat-list-item routerLink="/app/orders" routerLinkActive="active">
          <mat-icon>shopping_cart</mat-icon>
          <span style="margin-left:8px;">Commandes</span>
        </a>

        <a mat-list-item routerLink="/app/clients" routerLinkActive="active">
          <mat-icon>group</mat-icon>
          <span style="margin-left:8px;">Clients</span>
        </a>

        <a mat-list-item routerLink="/app/notifications" routerLinkActive="active">
          <mat-icon>notifications</mat-icon>
          <span style="margin-left:8px;">Notifications</span>
        </a>
      </mat-nav-list>
    </mat-sidenav>

    <mat-sidenav-content>
      <mat-toolbar>
        <span style="font-weight:600;">{{ title() }}</span>
        <span style="flex:1 1 auto;"></span>

        <span style="margin-right:12px; opacity:.8;">{{ userEmail() }}</span>
        <button mat-raised-button (click)="logout()">Logout</button>
      </mat-toolbar>

      <div class="container">
        <router-outlet></router-outlet>
      </div>
    </mat-sidenav-content>
  </mat-sidenav-container>
  `,
  styles: [`.active{font-weight:600}`]
})
export class ShellComponent {
  constructor(private auth: AuthService) {}

  userEmail = computed(() => this.auth.user()?.email ?? '');
  title = computed(() => 'Microservices Dashboard');

  logout() { this.auth.logout(); location.href = '/login'; }
}
EOF

cat > src/app/ui/login/login.component.ts <<'EOF'
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
  <div style="height:100vh; display:grid; place-items:center;">
    <mat-card class="card" style="width:420px; padding:16px;">
      <h2 style="margin:0 0 12px 0;">Connexion</h2>
      <p style="margin:0 0 16px 0; opacity:.8;">Email + mot de passe (auth simulée pour le moment).</p>

      <mat-form-field appearance="outline" style="width:100%;">
        <mat-label>Email</mat-label>
        <input matInput [(ngModel)]="email" placeholder="admin@demo.com">
      </mat-form-field>

      <mat-form-field appearance="outline" style="width:100%;">
        <mat-label>Mot de passe</mat-label>
        <input matInput type="password" [(ngModel)]="password" placeholder="********">
      </mat-form-field>

      <button mat-raised-button style="width:100%; margin-top:8px;" (click)="doLogin()">Se connecter</button>

      <div style="margin-top:12px; font-size:12px; opacity:.75;">
        Astuce: si l'email contient <b>admin</b> ⇒ rôle ADMIN, sinon USER.
      </div>
    </mat-card>
  </div>
  `
})
export class LoginComponent {
  email = 'admin@demo.com';
  password = 'admin';

  constructor(private auth: AuthService, private router: Router) {}

  doLogin() {
    if (!this.email.trim()) return;
    this.auth.login({ email: this.email, password: this.password });
    this.router.navigateByUrl('/app/dashboard');
  }
}
EOF

cat > src/app/ui/dashboard/dashboard.component.ts <<'EOF'
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsApi } from '../../api/products.api';
import { OrdersApi } from '../../api/orders.api';
import { ClientsApi } from '../../api/clients.api';

import { MatCardModule } from '@angular/material/card';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, MatCardModule],
  template: `
    <div style="display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:16px;">
      <mat-card class="card">
        <div style="padding:16px;">
          <div style="opacity:.7;">Produits</div>
          <div style="font-size:32px; font-weight:700;">{{ productsCount() }}</div>
        </div>
      </mat-card>

      <mat-card class="card">
        <div style="padding:16px;">
          <div style="opacity:.7;">Commandes</div>
          <div style="font-size:32px; font-weight:700;">{{ ordersCount() }}</div>
        </div>
      </mat-card>

      <mat-card class="card">
        <div style="padding:16px;">
          <div style="opacity:.7;">Clients</div>
          <div style="font-size:32px; font-weight:700;">{{ clientsCount() }}</div>
        </div>
      </mat-card>
    </div>
  `
})
export class DashboardComponent {
  productsCount = signal(0);
  ordersCount = signal(0);
  clientsCount = signal(0);

  constructor(products: ProductsApi, orders: OrdersApi, clients: ClientsApi) {
    products.list().subscribe({ next: v => this.productsCount.set(v.length), error: () => this.productsCount.set(0) });
    orders.list().subscribe({ next: v => this.ordersCount.set(v.length), error: () => this.ordersCount.set(0) });
    clients.list().subscribe({ next: v => this.clientsCount.set(v.length), error: () => this.clientsCount.set(0) });
  }
}
EOF

# Simple list pages (clean + working)
cat > src/app/ui/products/products.component.ts <<'EOF'
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsApi } from '../../api/products.api';
import { Product } from '../../api/api.models';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  standalone: true,
  selector: 'app-products',
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
  <mat-card class="card">
    <div style="padding:16px; display:flex; gap:12px; flex-wrap:wrap; align-items:end;">
      <h2 style="margin:0; flex:1 1 auto;">Produits</h2>

      <mat-form-field appearance="outline">
        <mat-label>Nom</mat-label>
        <input matInput [(ngModel)]="name">
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Prix</mat-label>
        <input matInput type="number" [(ngModel)]="price">
      </mat-form-field>

      <button mat-raised-button (click)="add()">Ajouter</button>
      <button mat-button (click)="load()">Rafraîchir</button>
    </div>

    <div style="padding:0 16px 16px 16px;">
      <div *ngIf="items().length===0" style="opacity:.7;">Aucun produit (ou API non dispo).</div>

      <div *ngFor="let p of items()" style="display:flex; justify-content:space-between; padding:12px 0; border-top:1px solid #eee;">
        <div>
          <div style="font-weight:600;">{{ p.name }}</div>
          <div style="opacity:.7;">{{ p.price }} MAD</div>
        </div>
        <button mat-stroked-button (click)="remove(p)" [disabled]="!p.id">Supprimer</button>
      </div>
    </div>
  </mat-card>
  `
})
export class ProductsComponent {
  items = signal<Product[]>([]);
  name = '';
  price = 10;

  constructor(private api: ProductsApi) { this.load(); }

  load() {
    this.api.list().subscribe({ next: v => this.items.set(v), error: () => this.items.set([]) });
  }

  add() {
    if (!this.name.trim()) return;
    this.api.create({ name: this.name.trim(), price: Number(this.price) }).subscribe({
      next: () => { this.name=''; this.load(); }
    });
  }

  remove(p: Product) {
    if (!p.id) return;
    this.api.delete(p.id).subscribe({ next: () => this.load() });
  }
}
EOF

cat > src/app/ui/orders/orders.component.ts <<'EOF'
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersApi } from '../../api/orders.api';
import { Order } from '../../api/api.models';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  standalone: true,
  selector: 'app-orders',
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
  <mat-card class="card">
    <div style="padding:16px; display:flex; gap:12px; flex-wrap:wrap; align-items:end;">
      <h2 style="margin:0; flex:1 1 auto;">Commandes</h2>

      <mat-form-field appearance="outline">
        <mat-label>Client ID</mat-label>
        <input matInput type="number" [(ngModel)]="clientId">
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Produit ID</mat-label>
        <input matInput type="number" [(ngModel)]="productId">
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Quantité</mat-label>
        <input matInput type="number" [(ngModel)]="quantity">
      </mat-form-field>

      <button mat-raised-button (click)="add()">Créer</button>
      <button mat-button (click)="load()">Rafraîchir</button>
    </div>

    <div style="padding:0 16px 16px 16px;">
      <div *ngIf="items().length===0" style="opacity:.7;">Aucune commande (ou API non dispo).</div>

      <div *ngFor="let o of items()" style="display:flex; justify-content:space-between; padding:12px 0; border-top:1px solid #eee;">
        <div>
          <div style="font-weight:600;">Order #{{ o.id ?? '—' }}</div>
          <div style="opacity:.7;">clientId={{ o.clientId }}, productId={{ o.productId }}, qty={{ o.quantity }}, status={{ o.status ?? '—' }}</div>
        </div>
        <button mat-stroked-button (click)="ship(o)" [disabled]="!o.id">Ship</button>
      </div>
    </div>
  </mat-card>
  `
})
export class OrdersComponent {
  items = signal<Order[]>([]);
  clientId = 1;
  productId = 1;
  quantity = 1;

  constructor(private api: OrdersApi) { this.load(); }

  load() {
    this.api.list().subscribe({ next: v => this.items.set(v), error: () => this.items.set([]) });
  }

  add() {
    this.api.create({
      clientId: Number(this.clientId),
      productId: Number(this.productId),
      quantity: Number(this.quantity),
    }).subscribe({ next: () => this.load() });
  }

  ship(o: Order) {
    if (!o.id) return;
    this.api.updateStatus(o.id, 'SHIPPED').subscribe({ next: () => this.load() });
  }
}
EOF

cat > src/app/ui/clients/clients.component.ts <<'EOF'
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientsApi } from '../../api/clients.api';
import { Client } from '../../api/api.models';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  standalone: true,
  selector: 'app-clients',
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
  <mat-card class="card">
    <div style="padding:16px; display:flex; gap:12px; flex-wrap:wrap; align-items:end;">
      <h2 style="margin:0; flex:1 1 auto;">Clients</h2>

      <mat-form-field appearance="outline">
        <mat-label>Nom complet</mat-label>
        <input matInput [(ngModel)]="fullName">
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Email</mat-label>
        <input matInput [(ngModel)]="email">
      </mat-form-field>

      <button mat-raised-button (click)="add()">Ajouter</button>
      <button mat-button (click)="load()">Rafraîchir</button>
    </div>

    <div style="padding:0 16px 16px 16px;">
      <div *ngIf="items().length===0" style="opacity:.7;">Aucun client (ou API non dispo).</div>

      <div *ngFor="let c of items()" style="display:flex; justify-content:space-between; padding:12px 0; border-top:1px solid #eee;">
        <div>
          <div style="font-weight:600;">{{ c.fullName }}</div>
          <div style="opacity:.7;">{{ c.email }}</div>
        </div>
        <button mat-stroked-button (click)="remove(c)" [disabled]="!c.id">Supprimer</button>
      </div>
    </div>
  </mat-card>
  `
})
export class ClientsComponent {
  items = signal<Client[]>([]);
  fullName = '';
  email = '';

  constructor(private api: ClientsApi) { this.load(); }

  load() {
    this.api.list().subscribe({ next: v => this.items.set(v), error: () => this.items.set([]) });
  }

  add() {
    if (!this.fullName.trim() || !this.email.trim()) return;
    this.api.create({ fullName: this.fullName.trim(), email: this.email.trim() }).subscribe({
      next: () => { this.fullName=''; this.email=''; this.load(); }
    });
  }

  remove(c: Client) {
    if (!c.id) return;
    this.api.delete(c.id).subscribe({ next: () => this.load() });
  }
}
EOF

cat > src/app/ui/notifications/notifications.component.ts <<'EOF'
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsApi } from '../../api/notifications.api';
import { NotificationMessage } from '../../api/api.models';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-notifications',
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
  <mat-card class="card">
    <div style="padding:16px; display:flex; align-items:center;">
      <h2 style="margin:0; flex:1 1 auto;">Notifications</h2>
      <button mat-button (click)="load()">Rafraîchir</button>
    </div>

    <div style="padding:0 16px 16px 16px;">
      <div *ngIf="items().length===0" style="opacity:.7;">Aucune notification (ou API non dispo).</div>

      <div *ngFor="let n of items()" style="padding:12px 0; border-top:1px solid #eee;">
        <div style="font-weight:600;">{{ n.subject ?? 'Notification' }}</div>
        <div style="opacity:.75;">{{ n.text ?? '' }}</div>
        <div style="font-size:12px; opacity:.6;">to={{ n.to ?? '—' }} | {{ n.createdAt ?? '' }}</div>
      </div>
    </div>
  </mat-card>
  `
})
export class NotificationsComponent {
  items = signal<NotificationMessage[]>([]);
  constructor(private api: NotificationsApi) { this.load(); }
  load() {
    this.api.list().subscribe({ next: v => this.items.set(v), error: () => this.items.set([]) });
  }
}
EOF

# ===== Routes + App config =====
cat > src/app/app.routes.ts <<'EOF'
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

import { LoginComponent } from './ui/login/login.component';
import { ShellComponent } from './ui/layout/shell.component';
import { DashboardComponent } from './ui/dashboard/dashboard.component';
import { ProductsComponent } from './ui/products/products.component';
import { OrdersComponent } from './ui/orders/orders.component';
import { ClientsComponent } from './ui/clients/clients.component';
import { NotificationsComponent } from './ui/notifications/notifications.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  { path: 'login', component: LoginComponent },

  {
    path: 'app',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'notifications', component: NotificationsComponent }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
EOF

cat > src/app/app.config.ts <<'EOF'
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations()
  ]
};
EOF

cat > src/app/app.component.ts <<'EOF'
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {}
EOF

# Ensure main.ts uses appConfig/appRoot (Angular standalone)
cat > src/main.ts <<'EOF'
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
EOF

# Update package.json scripts (serve with proxy)
node - <<'EOF'
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts.start = "ng serve --proxy-config proxy.conf.json";
pkg.scripts.build = pkg.scripts.build || "ng build";
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
EOF

echo "✅ Frontend ready."
echo "➡️  Run it:"
echo "   cd $APP_DIR"
echo "   npm start"
echo ""
echo "➡️  Open:"
echo "   http://localhost:4200"
echo ""
echo "ℹ️  API calls go through proxy to: $GATEWAY_URL"
