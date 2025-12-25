import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
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
    MatFormFieldModule,
  ],
  templateUrl: './ticket-details.component.html',
  styleUrl: './ticket-details.component.css',
})
export class TicketDetailsComponent {
  readonly ticket = input<Ticket | undefined>();
  readonly sendMessage = output<string>();
  readonly resolve = output<string>();

  readonly replyText = signal('');

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
}
