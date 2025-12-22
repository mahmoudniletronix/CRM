import { Routes } from '@angular/router';
import { AuthGuard } from './Core/domain/guards/auth.guard';
export const routes: Routes = [
  {
    path: 'tickets',
    loadComponent: () =>
      import('./Feature/Tickets/tickets-management.component').then(
        (m) => m.TicketsManagementComponent
      ),
    canActivate: [AuthGuard],
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
    canActivate: [AuthGuard],
    loadComponent: () => import('./Feature/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'clients/tickets',
    loadComponent: () =>
      import('./Feature/Clients/clients-tickets-view.component').then(
        (m) => m.ClientsTicketsViewComponent
      ),
  },
  { path: '**', redirectTo: 'login' },
];
