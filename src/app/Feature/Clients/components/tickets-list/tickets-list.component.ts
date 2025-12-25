import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  Ticket,
  TicketStatus,
  TicketPriority,
} from '../../../../Core/domain/models/ticket.model/ticket.model';
import { TicketsService } from '../../../../Services/tickets/tickets.service';

@Component({
  selector: 'app-tickets-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatIconModule, MatButtonModule],
  templateUrl: './tickets-list.component.html',
  styleUrls: ['./tickets-list.component.css'],
})
export class TicketsListComponent {
  tickets = input.required<Ticket[]>();
  private readonly ticketsService = inject(TicketsService);

  readonly TicketStatus = TicketStatus;

  getStatusColor(status: TicketStatus): string {
    const colors = {
      [TicketStatus.Pending]: '#3b82f6',
      [TicketStatus.Assigned]: '#f59e0b',
      [TicketStatus.Closed]: '#6b7280',
      [TicketStatus.Rejected]: '#dc2626',
    };
    return colors[status] || '#6b7280';
  }

  getStatusIcon(status: TicketStatus): string {
    const icons = {
      [TicketStatus.Pending]: 'mail',
      [TicketStatus.Assigned]: 'schedule',
      [TicketStatus.Closed]: 'check_circle',
      [TicketStatus.Rejected]: 'cancel',
    };
    return icons[status] || 'help';
  }

  getPriorityColor(priority: TicketPriority): string {
    // TicketPriority is a number now, but input might be expecting string?
    // Wait, TicketPriority is enum number.
    // Let's assume input 'tickets' has priority as number.
    // The previous implementation used string keys "Low", "Medium" etc.
    // We should either update the model to use numbers or handle mapping.
    // Ticket interface says priority: TicketPriority (which is number).
    // So priority here is likely number.
    const colors: Record<number, string> = {
      [TicketPriority.Low]: '#10b981',
      [TicketPriority.Medium]: '#f59e0b',
      [TicketPriority.High]: '#ef4444',
      [TicketPriority.Urgent]: '#dc2626',
    };
    // Safe cast or handle if it's strictly typed
    return colors[priority] || '#6b7280';
  }

  getPriorityIcon(priority: TicketPriority): string {
    const icons: Record<number, string> = {
      [TicketPriority.Low]: 'arrow_downward',
      [TicketPriority.Medium]: 'remove',
      [TicketPriority.High]: 'arrow_upward',
      [TicketPriority.Urgent]: 'priority_high',
    };
    return icons[priority] || 'flag';
  }

  formatDate(date: Date): string {
    const now = new Date();
    const ticketDate = new Date(date);
    const diffMs = now.getTime() - ticketDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return ticketDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  deleteTicket(id: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this ticket?')) {
      this.ticketsService.deleteTicket(id).subscribe({
        error: (err) => console.error('Failed to delete ticket', err),
      });
    }
  }
}
