import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TicketFormComponent } from './components/ticket-form/ticket-form.component';
import { TicketsListComponent } from './components/tickets-list/tickets-list.component';
import { TicketsService } from '../../Services/tickets/tickets.service';
import { CreateTicketDto } from '../../Core/domain/models/ticket.model';

@Component({
  selector: 'app-clients-tickets-view',
  standalone: true,
  imports: [CommonModule, MatIconModule, TicketFormComponent, TicketsListComponent],
  templateUrl: './clients-tickets-view.component.html',
  styleUrls: ['./clients-tickets-view.component.css'],
})
export class ClientsTicketsViewComponent {
  private readonly ticketsService = inject(TicketsService);

  readonly tickets = this.ticketsService.tickets;
  readonly activeTab = signal<'create' | 'list'>('create');

  onTicketCreated(dto: CreateTicketDto): void {
    this.ticketsService.createTicket(dto);
    // Switch to list tab to show the newly created ticket
    this.activeTab.set('list');
  }

  switchTab(tab: 'create' | 'list'): void {
    this.activeTab.set(tab);
  }
}
