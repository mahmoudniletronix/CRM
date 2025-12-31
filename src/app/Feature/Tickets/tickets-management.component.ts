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
import { Auth } from '../../Services/auth/auth';

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
  private readonly authService = inject(Auth);

  readonly user = this.authService.currentUser;

  readonly tickets = this.ticketsService.tickets;
  readonly selectedTicketId = signal<string | null>(null);

  // Pagination Signals
  readonly currentPage = this.ticketsService.currentPage;
  readonly hasNextPage = this.ticketsService.hasNextPage;
  readonly hasPreviousPage = this.ticketsService.hasPreviousPage;

  readonly currentFilters = signal<TicketFilter>({
    status: 'All',
    priority: 'All',
    searchQuery: '',
  });

  constructor() {
    this.loadTickets();
  }

  loadTickets() {
    const { searchQuery, status, priority } = this.currentFilters();
    this.ticketsService.loadSuperAdminTickets(
      this.currentPage(),
      10, // Default pageSize
      searchQuery,
      String(status),
      String(priority)
    );
  }

  onPageChange(page: number) {
    const { searchQuery, status, priority } = this.currentFilters();
    this.ticketsService.loadSuperAdminTickets(
      page,
      10,
      searchQuery,
      String(status),
      String(priority)
    );
  }

  // Computed filtered list - Now just a passthrough since API handles filtering
  readonly filteredTickets = computed(() => this.tickets());

  // Computed selected ticket
  readonly selectedTicket = computed(() => {
    const id = this.selectedTicketId();
    return id ? this.ticketsService.getTicketById(id) : undefined;
  });

  updateFilters(filters: TicketFilter) {
    this.currentFilters.set(filters);
    // Reload from page 1 when filters change
    this.ticketsService.loadSuperAdminTickets(
      1,
      10,
      filters.searchQuery,
      String(filters.status),
      String(filters.priority)
    );

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
    const ticket = this.selectedTicket();
    if (ticket) {
      this.ticketsService
        .updateTicketStatus(ticket.id, ticket.status, ticket.priority, content)
        .subscribe({
          next: () => {
            this.ticketsService.addMessage(ticket.id, content, 'agent').subscribe();
          },
          error: (err) => console.error('Failed to send message', err),
        });
    }
  }

  onResolveTicket(id: string) {
    this.ticketsService.resolveTicket(id).subscribe({
      error: (err) => console.error('Failed to resolve ticket', err),
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
