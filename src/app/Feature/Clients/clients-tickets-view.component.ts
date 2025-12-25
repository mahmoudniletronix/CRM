import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TicketFormComponent } from './components/ticket-form/ticket-form.component';
import { TicketsListComponent } from './components/tickets-list/tickets-list.component';
import { TicketsService } from '../../Services/tickets/tickets.service';
import { Auth } from '../../Services/auth/auth';

@Component({
  selector: 'app-clients-tickets-view',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    TicketFormComponent,
    TicketsListComponent,
  ],
  templateUrl: './clients-tickets-view.component.html',
  styleUrls: ['./clients-tickets-view.component.css'],
})
export class ClientsTicketsViewComponent {
  private readonly ticketsService = inject(TicketsService);
  private readonly auth = inject(Auth);

  readonly tickets = this.ticketsService.tickets;
  readonly activeTab = signal<'create' | 'list'>('create');

  ngOnInit() {
    this.ticketsService.loadTickets().subscribe();
  }

  onTicketCreated(dto: any): void {
    this.activeTab.set('list');
  }

  switchTab(tab: 'create' | 'list'): void {
    this.activeTab.set(tab);
  }

  logout(): void {
    this.auth.logout();
  }
}
