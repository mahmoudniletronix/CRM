import { Routes } from '@angular/router';
import { AuthGuard } from './Core/domain/guards/auth.guard';
import { RoleGuard } from './Core/domain/guards/role.guard';

export const routes: Routes = [
  {
    path: 'tickets',
    canActivate: [RoleGuard],
    data: { roles: ['SuperAdmin', 'SupportTeam'] },
    loadComponent: () =>
      import('./Feature/Tickets/tickets-management.component').then(
        (m) => m.TicketsManagementComponent
      ),
  },
  {
    path: 'support',
    canActivate: [RoleGuard],
    data: { roles: ['SuperAdmin'] },
    loadComponent: () =>
      import('./Feature/dashboard/components/support-management/support-management.component').then(
        (m) => m.SupportManagementComponent
      ),
  },
  {
    path: 'clients',
    canActivate: [RoleGuard],
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
    path: 'dashboard',
    canActivate: [RoleGuard],
    data: { roles: ['SuperAdmin'] },
    loadComponent: () => import('./Feature/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'clients/tickets',
    canActivate: [RoleGuard],
    data: { roles: ['AccountAdmin', 'SuperAdmin'] },
    loadComponent: () =>
      import('./Feature/Clients/clients-tickets-view.component').then(
        (m) => m.ClientsTicketsViewComponent
      ),
  },
  {
    path: 'renewal',
    canActivate: [RoleGuard],
    data: { roles: ['SuperAdmin'] },
    loadComponent: () =>
      import('./Feature/dashboard/components/renewal-products/renewal-products.component').then(
        (m) => m.RenewalProductsComponent
      ),
  },
  { path: '**', redirectTo: 'login' },
];
