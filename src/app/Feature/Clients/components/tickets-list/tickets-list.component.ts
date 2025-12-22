import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Ticket, TicketStatus } from '../../../../Core/domain/models/ticket.model';
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
      [TicketStatus.Open]: '#3b82f6',
      [TicketStatus.InProgress]: '#f59e0b',
      [TicketStatus.Resolved]: '#10b981',
      [TicketStatus.Closed]: '#6b7280',
    };
    return colors[status] || '#6b7280';
  }

  getStatusIcon(status: TicketStatus): string {
    const icons = {
      [TicketStatus.Open]: 'mail',
      [TicketStatus.InProgress]: 'schedule',
      [TicketStatus.Resolved]: 'check_circle',
      [TicketStatus.Closed]: 'cancel',
    };
    return icons[status] || 'help';
  }

  getPriorityColor(priority: string): string {
    const colors = {
      Low: '#10b981',
      Medium: '#f59e0b',
      High: '#ef4444',
      Urgent: '#dc2626',
    };
    return colors[priority as keyof typeof colors] || '#6b7280';
  }

  getPriorityIcon(priority: string): string {
    const icons = {
      Low: 'arrow_downward',
      Medium: 'remove',
      High: 'arrow_upward',
      Urgent: 'priority_high',
    };
    return icons[priority as keyof typeof icons] || 'flag';
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
      this.ticketsService.deleteTicket(id);
    }
  }
}
