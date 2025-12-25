import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {
  Ticket,
  TicketStatus,
  TicketPriority,
} from '../../../../Core/domain/models/ticket.model/ticket.model';

@Component({
  selector: 'app-ticket-list-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './ticket-list-sidebar.component.html',
  styleUrl: './ticket-list-sidebar.component.css',
})
export class TicketListSidebarComponent {
  readonly tickets = input.required<Ticket[]>();
  readonly selectedId = input<string | null>(null);
  readonly select = output<string>();

  // Pagination Inputs
  readonly currentPage = input<number>(1);
  readonly hasNextPage = input<boolean>(false);
  readonly hasPreviousPage = input<boolean>(false);
  readonly pageChange = output<number>();

  getStatusClass(status: TicketStatus): string {
    switch (status) {
      case TicketStatus.Pending:
        return 'pending';
      case TicketStatus.Assigned:
        return 'assigned';
      case TicketStatus.Closed:
        return 'closed';
      case TicketStatus.Rejected:
        return 'rejected';
      default:
        return '';
    }
  }

  getStatusLabel(status: TicketStatus): string {
    return TicketStatus[status];
  }

  getPriorityClass(priority: TicketPriority): string {
    switch (priority) {
      case TicketPriority.Low:
        return 'low';
      case TicketPriority.Medium:
        return 'medium';
      case TicketPriority.High:
        return 'high';
      case TicketPriority.Urgent:
        return 'urgent';
      default:
        return '';
    }
  }

  getPriorityLabel(priority: TicketPriority): string {
    return TicketPriority[priority];
  }
}
