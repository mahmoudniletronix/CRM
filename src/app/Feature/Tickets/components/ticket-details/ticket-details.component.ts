import { Component, input, output, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TicketsService } from '../../../../Services/tickets/tickets.service';
import {
  Ticket,
  TicketPriority,
  TicketStatus,
} from '../../../../Core/domain/models/ticket.model/ticket.model';

@Component({
  selector: 'app-ticket-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './ticket-details.component.html',
  styleUrl: './ticket-details.component.css',
})
export class TicketDetailsComponent {
  readonly ticket = input<Ticket | undefined>();
  readonly sendMessage = output<string>();
  readonly resolve = output<string>();

  readonly replyText = signal('');
  private readonly ticketsService = inject(TicketsService);

  readonly TicketStatus = TicketStatus;
  readonly TicketPriority = TicketPriority;

  readonly statusOptions = [
    { value: TicketStatus.Pending, label: 'Pending' },
    { value: TicketStatus.Assigned, label: 'Assigned' },
    { value: TicketStatus.Closed, label: 'Closed' },
    { value: TicketStatus.Rejected, label: 'Rejected' },
  ];

  readonly priorityOptions = [
    { value: TicketPriority.Low, label: 'Low' },
    { value: TicketPriority.Medium, label: 'Medium' },
    { value: TicketPriority.High, label: 'High' },
    { value: TicketPriority.Urgent, label: 'Urgent' },
  ];

  // Clear text when ticket changes
  constructor() {
    effect(() => {
      this.ticket();
      this.replyText.set('');
    });
  }

  sendReply() {
    if (this.replyText().trim()) {
      this.sendMessage.emit(this.replyText());
      this.replyText.set('');
    }
  }

  onStatusChange(event: any) {
    const t = this.ticket();
    if (t) {
      this.ticketsService.updateTicketStatus(t.id, event.value, t.priority).subscribe();
    }
  }

  onPriorityChange(event: any) {
    const t = this.ticket();
    if (t) {
      this.ticketsService.updateTicketStatus(t.id, t.status, event.value).subscribe();
    }
  }

  getStatusLabel(status: TicketStatus): string {
    return this.statusOptions.find((o) => o.value === status)?.label || 'Unknown';
  }

  getPriorityLabel(priority: TicketPriority): string {
    return this.priorityOptions.find((o) => o.value === priority)?.label || 'Unknown';
  }
}
