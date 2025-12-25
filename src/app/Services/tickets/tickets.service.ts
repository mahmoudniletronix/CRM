import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Ticket,
  TicketCreatePayload,
  TicketStatus,
  TicketPriority,
} from '../../Core/domain/models/ticket.model/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/Ticket`;

  // Signal-based state
  private readonly ticketsSignal = signal<Ticket[]>([]);

  // Public readonly signals
  readonly tickets = this.ticketsSignal.asReadonly();

  readonly isSubmitting = signal(false);
  readonly lastCreatedOk = signal(false);
  readonly errorMessage = signal<string | null>(null);

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
  createTicket(payload: TicketCreatePayload): Observable<unknown> {
    const formData = this.toFormData(payload);

    this.isSubmitting.set(true);
    this.lastCreatedOk.set(false);
    this.errorMessage.set(null);

    return this.http.post(this.baseUrl, formData).pipe(
      tap({
        next: (response: any) => {
          this.isSubmitting.set(false);
          this.lastCreatedOk.set(true);

          const newTicket: Ticket = {
            id: response?.id || this.generateId(),
            subject: payload.subject,
            description: payload.description,
            email: payload.email,
            phone: payload.phoneNumber || '',
            status: TicketStatus.Open,
            priority: this.mapSeverityToPriority(payload.severity),
            messages: [],
            createdAt: new Date(),
          };

          this.ticketsSignal.update((tickets) => [newTicket, ...tickets]);
          this.saveToLocalStorage();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.lastCreatedOk.set(false);
          this.errorMessage.set(this.extractError(err));
        },
      })
    );
  }

  /**
   * Load tickets
   */
  loadTickets(): Observable<Ticket[]> {
    this.loadFromLocalStorage();
    return of(this.ticketsSignal());
  }

  getTicketById(id: string): Ticket | undefined {
    return this.ticketsSignal().find((t) => t.id === id);
  }

  deleteTicket(id: string): Observable<void> {
    this.ticketsSignal.update((tickets) => tickets.filter((t) => t.id !== id));
    this.saveToLocalStorage();
    return of(undefined);
  }

  resolveTicket(id: string): Observable<void> {
    this.ticketsSignal.update((tickets) =>
      tickets.map((t) =>
        t.id === id ? { ...t, status: TicketStatus.Resolved, updatedAt: new Date() } : t
      )
    );
    this.saveToLocalStorage();
    return of(undefined);
  }

  addMessage(
    ticketId: string,
    content: string,
    sender: 'client' | 'agent' | 'system'
  ): Observable<void> {
    const message = {
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
    return of(undefined);
  }

  private toFormData(p: TicketCreatePayload): FormData {
    const fd = new FormData();
    fd.append('Description', p.description);
    fd.append('Email', p.email);
    fd.append('Subject', p.subject);
    fd.append('PhoneNumber', p.phoneNumber ?? '');
    fd.append('Severity', String(p.severity));
    fd.append('SiteId', p.siteId);
    fd.append('ProductId', p.productId);

    for (const file of p.attachments ?? []) {
      fd.append('Attachments', file, file.name);
    }

    return fd;
  }

  private extractError(err: unknown): string {
    const anyErr = err as any;
    if (anyErr?.error) {
      if (typeof anyErr.error === 'string') return anyErr.error;
      if (anyErr.error?.message) return anyErr.error.message;
      if (anyErr.error?.title) return anyErr.error.title;
    }
    if (anyErr?.message) return anyErr.message;
    return 'حدث خطأ غير متوقع أثناء إنشاء التذكرة';
  }

  private generateId(): string {
    return `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private mapSeverityToPriority(severity: number): TicketPriority {
    const map: Record<number, TicketPriority> = {
      0: TicketPriority.Low,
      1: TicketPriority.Medium,
      2: TicketPriority.High,
      3: TicketPriority.Urgent,
    };
    return map[severity] || TicketPriority.Medium;
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('client_tickets', JSON.stringify(this.ticketsSignal()));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('client_tickets');
      if (stored) {
        const parsed = JSON.parse(stored);
        const mapped = parsed.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: t.updatedAt ? new Date(t.updatedAt) : undefined,
          messages: (t.messages || []).map((m: any) => ({
            ...m,
            createdAt: new Date(m.createdAt),
          })),
        }));
        this.ticketsSignal.set(mapped);
      }
    } catch (e) {
      console.error('Failed to load from localStorage', e);
    }
  }
}
