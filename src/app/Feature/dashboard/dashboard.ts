import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ClientsTableComponent } from './components/clients-table-component/clients-table-component';
import { Router, RouterModule } from '@angular/router';
import { ClientsService } from '../../Services/clients/clients';
import { Auth } from '../../Services/auth/auth';
import { ClientCreateComponent } from '../Client-Management/components/client-create/client-create-component';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterModule, ClientsTableComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly authService = inject(Auth);
  private readonly clientsService = inject(ClientsService);
  private readonly router = inject(Router);

  readonly user = this.authService.currentUser;

  readonly totals = computed(() => {
    const clients = this.clientsService.clients();
    const sum = clients.reduce(
      (acc, c) => {
        acc.pending += c.ticketStats.pending;
        acc.assigned += c.ticketStats.assigned;
        acc.closed += c.ticketStats.closed;
        return acc;
      },
      { pending: 0, assigned: 0, closed: 0 }
    );
    return {
      clients: clients.length,
      ...sum,
    };
  });

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
