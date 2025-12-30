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
  { path: 'register', loadComponent: () => import('./ui/register/register.component').then(m => m.RegisterComponent) },

  {
    path: 'app',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'payments', loadComponent: () => import('./ui/payments/payments.component').then(m => m.PaymentsComponent) },
      { path: 'cart', loadComponent: () => import('./ui/cart/cart.component').then(m => m.CartComponent) },

      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'admin/products', loadComponent: () => import('./ui/admin/admin-products.component').then(m => m.AdminProductsComponent) },
      { path: 'orders', component: OrdersComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'settings', loadComponent: () => import('./ui/settings/settings.component').then(m => m.SettingsComponent) },
      { path: 'settings/change-password', loadComponent: () => import('./ui/settings/change-password.component').then(m => m.ChangePasswordComponent) }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
