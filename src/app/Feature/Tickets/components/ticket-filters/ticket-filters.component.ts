import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TicketPriority, TicketStatus } from '../../../../Core/domain/models/ticket.model';

export interface TicketFilter {
  status: TicketStatus | 'All';
  priority: TicketPriority | 'All';
}

@Component({
  selector: 'app-ticket-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './ticket-filters.component.html',
  styleUrl: './ticket-filters.component.css',
})
export class TicketFiltersComponent {
  readonly filterChange = output<TicketFilter>();

  filters: TicketFilter = { status: 'All', priority: 'All' };

  readonly statuses = Object.values(TicketStatus);
  readonly priorities = Object.values(TicketPriority);

  onFilterChange() {
    this.filterChange.emit(this.filters);
  }
}
