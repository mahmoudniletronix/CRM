import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketsService } from '../../Services/tickets/tickets.service';
import {
  TicketFiltersComponent,
  TicketFilter,
} from './components/ticket-filters/ticket-filters.component';
import { TicketListSidebarComponent } from './components/ticket-list/ticket-list-sidebar.component';
import { TicketDetailsComponent } from './components/ticket-details/ticket-details.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tickets-management',
  standalone: true,
  imports: [
    CommonModule,
    TicketFiltersComponent,
    TicketListSidebarComponent,
    TicketDetailsComponent,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    RouterLink,
  ],
  templateUrl: './tickets-management.component.html',
  styleUrl: './tickets-management.component.css',
})
export class TicketsManagementComponent {
  private readonly ticketsService = inject(TicketsService);

  readonly tickets = this.ticketsService.tickets;
  readonly selectedTicketId = signal<string | null>(null);

  readonly currentFilters = signal<TicketFilter>({ status: 'All', priority: 'All' });

  // Computed filtered list
  readonly filteredTickets = computed(() => {
    const all = this.tickets();
    const filters = this.currentFilters();

    return all.filter((t) => {
      const statusMatch = filters.status === 'All' || t.status === filters.status;
      const priorityMatch = filters.priority === 'All' || t.priority === filters.priority;
      return statusMatch && priorityMatch;
    });
  });

  // Computed selected ticket
  readonly selectedTicket = computed(() => {
    const id = this.selectedTicketId();
    return id ? this.ticketsService.getTicketById(id) : undefined;
  });

  updateFilters(filters: TicketFilter) {
    this.currentFilters.set(filters);

    // Deselect if currently selected ticket disappears from list
    const selected = this.selectedTicket();
    if (selected) {
      const stillVisible = this.filteredTickets().some((t) => t.id === selected.id);
      if (!stillVisible) {
        this.selectedTicketId.set(null);
      }
    }
  }

  selectTicket(id: string) {
    this.selectedTicketId.set(id);
  }

  onSendMessage(content: string) {
    const id = this.selectedTicketId();
    if (id) {
      this.ticketsService.addMessage(id, content, 'agent').subscribe({
        error: (err) => console.error('Failed to send message', err),
      });
    }
  }

  onResolveTicket(id: string) {
    this.ticketsService.resolveTicket(id).subscribe({
      error: (err) => console.error('Failed to resolve ticket', err),
    });
  }
}
