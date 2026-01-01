import { Component, input, output, signal, effect, inject, computed } from '@angular/core';
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
import { SupportService } from '../../../../Services/support/support.service';
import { Auth } from '../../../../Services/auth/auth';

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
  private readonly supportService = inject(SupportService);
  private readonly auth = inject(Auth);

  readonly TicketStatus = TicketStatus;
  readonly TicketPriority = TicketPriority;

  readonly supporters = signal<{ email: string; id: string; fullName: string }[]>([]);
  readonly isSuperAdmin = computed(() => this.auth.currentUser()?.role === 'SuperAdmin');
  readonly selectedSupporter = signal<string | null>(null);

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
      const t = this.ticket();
      if (t) {
        this.replyText.set('');
        this.selectedSupporter.set(null);
        this.currentStatus.set(t.status); //
      }
    });

    // Load supporters if super admin
    effect(() => {
      if (this.isSuperAdmin() && this.supporters().length === 0) {
        this.supportService.getSupporters().subscribe({
          next: (data) => this.supporters.set(data),
          error: (err) => console.error('Failed to load supporters', err),
        });
      }
    });
  }

  // Local state for status dropdown to allow UI flow before API commit
  readonly currentStatus = signal<TicketStatus>(TicketStatus.Pending);

  sendReply() {
    if (this.replyText().trim()) {
      this.sendMessage.emit(this.replyText());
      this.replyText.set('');
    }
  }

  onAssignChange(event: any) {
    const t = this.ticket();
    if (t && event.value) {
      this.ticketsService.assignTicket(t.id, event.value, t.priority).subscribe(() => {
        console.log('Assigned successfully');
        // Status is auto-updated by optimistic update in service, which updates ticket() input
      });
    }
  }

  onStatusChange(event: any) {
    const newStatus = event.value;
    const t = this.ticket();

    if (!t) return;

    // If status is Assigned, just update local state to show the supporter dropdown
    // Do NOT call API yet, user must select a supporter
    if (newStatus === TicketStatus.Assigned) {
      this.currentStatus.set(TicketStatus.Assigned);
      return;
    }

    // For other statuses, call API immediately
    this.ticketsService.updateTicketStatus(t.id, newStatus, t.priority).subscribe(() => {
      this.currentStatus.set(newStatus);
    });
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
