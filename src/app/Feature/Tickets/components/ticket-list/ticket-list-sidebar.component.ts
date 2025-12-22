import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Ticket } from '../../../../Core/domain/models/ticket.model';

@Component({
  selector: 'app-ticket-list-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './ticket-list-sidebar.component.html',
  styleUrl: './ticket-list-sidebar.component.css',
})
export class TicketListSidebarComponent {
  readonly tickets = input.required<Ticket[]>();
  readonly selectedId = input<string | null>(null);
  readonly select = output<string>();
}
