import { Routes } from '@angular/router';
import { authGuard } from './Services/auth/auth.guard';
import { roleGuard } from './Core/domain/guards/role.guard';

export const routes: Routes = [
  {
    path: 'tickets',
    canActivate: [roleGuard],
    data: { roles: ['SuperAdmin', 'Support', 'SupportTeam'] },
    loadComponent: () =>
      import('./Feature/Tickets/tickets-management.component').then(
        (m) => m.TicketsManagementComponent
      ),
  },
  {
    path: 'support',
    canActivate: [roleGuard],
    data: { roles: ['SuperAdmin'] },
    loadComponent: () =>
      import('./Feature/dashboard/components/support-management/support-management.component').then(
        (m) => m.SupportManagementComponent
      ),
  },
  {
    path: 'clients',
    canActivate: [roleGuard],
    data: { roles: ['SuperAdmin'] },
    loadComponent: () =>
      import('./Feature/Client-Management/client-management.component').then(
        (m) => m.ClientManagementComponent
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./Feature/auth/login-component/login-component').then((m) => m.LoginComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./Feature/auth/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },
  {
    path: 'dashboard',
    canActivate: [roleGuard],
    data: { roles: ['SuperAdmin'] },
    loadComponent: () => import('./Feature/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'clients/tickets',
    canActivate: [roleGuard],
    data: { roles: ['AccountAdmin', 'SuperAdmin'] },
    loadComponent: () =>
      import('./Feature/Clients/clients-tickets-view.component').then(
        (m) => m.ClientsTicketsViewComponent
      ),
  },
  {
    path: 'renewal',
    canActivate: [roleGuard],
    data: { roles: ['SuperAdmin'] },
    loadComponent: () =>
      import('./Feature/dashboard/components/renewal-products/renewal-products.component').then(
        (m) => m.RenewalProductsComponent
      ),
  },
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./Feature/auth/login-component/login-component').then((m) => m.LoginComponent),
  },
  { path: '**', redirectTo: 'login' },
];
