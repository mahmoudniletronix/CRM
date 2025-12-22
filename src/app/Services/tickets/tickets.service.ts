import { Injectable, signal, computed } from '@angular/core';
import {
  Ticket,
  CreateTicketDto,
  TicketStatus,
  TicketPriority,
} from '../../Core/domain/models/ticket.model';

@Injectable({
  providedIn: 'root',
})
export class TicketsService {
  // Signal-based state
  private readonly ticketsSignal = signal<Ticket[]>([]);

  // Public readonly signal
  readonly tickets = this.ticketsSignal.asReadonly();

  // Computed values
  readonly openTicketsCount = computed(
    () => this.ticketsSignal().filter((t) => t.status === TicketStatus.Open).length
  );

  readonly totalTicketsCount = computed(() => this.ticketsSignal().length);

  constructor() {
    this.loadFromLocalStorage();
  }

  /**
   * Create a new ticket
   */
  /**
   * Create a new ticket
   */
  createTicket(dto: CreateTicketDto): Ticket {
    const newTicket: Ticket = {
      id: this.generateId(),
      subject: dto.subject,
      description: dto.description,
      email: dto.email,
      phone: dto.phone,
      status: TicketStatus.Open,
      priority: dto.priority || TicketPriority.Medium,
      messages: [], // Initialize empty messages array
      createdAt: new Date(),
    };

    // Add to signal
    this.ticketsSignal.update((tickets) => [newTicket, ...tickets]);

    // Persist to localStorage
    this.saveToLocalStorage();

    return newTicket;
  }

  /**
   * Get all tickets
   */
  getTickets(): Ticket[] {
    return this.ticketsSignal();
  }

  /**
   * Get ticket by ID
   */
  getTicketById(id: string): Ticket | undefined {
    return this.ticketsSignal().find((t) => t.id === id);
  }

  /**
   * Update ticket status
   */
  updateTicketStatus(id: string, status: TicketStatus): void {
    this.ticketsSignal.update((tickets) =>
      tickets.map((ticket) =>
        ticket.id === id ? { ...ticket, status, updatedAt: new Date() } : ticket
      )
    );
    this.saveToLocalStorage();
  }

  /**
   * Add a message to a ticket
   */
  addMessage(ticketId: string, content: string, sender: 'client' | 'agent' | 'system'): void {
    const message: any = {
      id: this.generateId(),
      content,
      sender,
      createdAt: new Date(),
    };

    this.ticketsSignal.update((tickets) =>
      tickets.map((t) =>
        t.id === ticketId
          ? { ...t, messages: [...(t.messages || []), message], updatedAt: new Date() }
          : t
      )
    );
    this.saveToLocalStorage();
  }

  /**
   * Resolve a ticket
   */
  resolveTicket(id: string): void {
    this.updateTicketStatus(id, TicketStatus.Resolved);
    this.addMessage(id, 'Ticket resolved by agent.', 'system');
  }

  /**
   * Delete ticket
   */
  deleteTicket(id: string): void {
    this.ticketsSignal.update((tickets) => tickets.filter((t) => t.id !== id));
    this.saveToLocalStorage();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save to localStorage
   */
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('client_tickets', JSON.stringify(this.ticketsSignal()));
    } catch (error) {
      console.error('Failed to save tickets to localStorage', error);
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('client_tickets');
      if (stored) {
        const tickets = JSON.parse(stored);
        // Convert date strings back to Date objects
        const parsedTickets = tickets.map((t: any) => ({
          ...t,
          messages: t.messages
            ? t.messages.map((m: any) => ({ ...m, createdAt: new Date(m.createdAt) }))
            : [],
          createdAt: new Date(t.createdAt),
          updatedAt: t.updatedAt ? new Date(t.updatedAt) : undefined,
        }));
        this.ticketsSignal.set(parsedTickets);
      }
    } catch (error) {
      console.error('Failed to load tickets from localStorage', error);
    }
  }
}
