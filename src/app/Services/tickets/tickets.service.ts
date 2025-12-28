import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Ticket,
  TicketCreatePayload,
  TicketStatus,
  TicketPriority,
} from '../../Core/domain/models/ticket.model/ticket.model';

import { SitesService } from '../../Services/sites/sites.service';

@Injectable({ providedIn: 'root' })
export class TicketsService {
  private readonly http = inject(HttpClient);
  private readonly sitesService = inject(SitesService);
  private readonly baseUrl = `${environment.apiUrl}/api/Ticket`;

  // Signal-based state
  private readonly ticketsSignal = signal<Ticket[]>([]);

  // Public readonly signals
  readonly tickets = this.ticketsSignal.asReadonly();

  readonly isSubmitting = signal(false);
  readonly lastCreatedOk = signal(false);
  readonly errorMessage = signal<string | null>(null);

  getAccountStats(): Observable<{ ticketCount: number }> {
    return this.http.get<{ ticketCount: number }>(`${this.baseUrl}/GetAccount`);
  }

  // Computed values
  readonly openTicketsCount = computed(
    () => this.ticketsSignal().filter((t) => t.status === TicketStatus.Pending).length
  );

  readonly totalTicketsCount = computed(() => this.ticketsSignal().length);

  constructor() {
    this.loadFromLocalStorage();
  }

  /**
   * Create a new ticket
   */
  updateTicketStatus(
    id: string,
    status: TicketStatus,
    severity: TicketPriority,
    description: string = 'Updated by Admin'
  ): Observable<void> {
    const payload = {
      id,
      status,
      severity,
      description,
    };
    return this.http.post<void>(`${this.baseUrl}/UpdateStatus`, payload).pipe(
      tap(() => {
        this.ticketsSignal.update((tickets) =>
          tickets.map((t) => (t.id === id ? { ...t, status, priority: severity } : t))
        );
      })
    );
  }

  /**
   * Create a new ticket
   */
  createTicket(payload: TicketCreatePayload): Observable<unknown> {
    const safePayload: TicketCreatePayload = {
      ...payload,
      severity: Number.isFinite(payload.severity) ? payload.severity : 1,
    };

    const formData = this.toFormData(safePayload);

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
            subject: safePayload.subject,
            description: safePayload.description,
            email: safePayload.email,
            phone: safePayload.phoneNumber || '',
            status: TicketStatus.Pending,
            priority: this.mapSeverityToPriority(safePayload.severity),
            severity: safePayload.severity,
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

  // Pagination State
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalItems = signal(0);
  readonly hasNextPage = signal(false);
  readonly hasPreviousPage = signal(false);

  loadSuperAdminTickets(
    page: number = 1,
    pageSize: number = 10,
    search: string = '',
    status: string = '',
    severity: string = ''
  ): void {
    console.log(
      `Loading Super Admin Tickets (Page: ${page}, Size: ${pageSize}, Search: "${search}", Status: ${status}, Severity: ${severity})...`
    );

    let params = new HttpParams().set('PageNumber', page).set('PageSize', pageSize);

    if (search) params = params.set('SearchText', search);
    if (status && status !== 'All') params = params.set('Status', status);
    if (severity && severity !== 'All') params = params.set('Severity', severity);

    this.http
      .get<any>(`${environment.apiUrl}/api/Ticket/GetAllForSuperAdmin`, { params })
      .subscribe({
        next: (response) => {
          console.log('Tickets Response received:', response);

          // Update pagination signals
          this.currentPage.set(response.currentPage);
          this.pageSize.set(response.pageSize);
          this.totalItems.set(response.totalItems);
          this.hasNextPage.set(response.hasNextPage);
          this.hasPreviousPage.set(response.hasPreviousPage);

          const mappedTickets: Ticket[] = response.data.map((t: any) => ({
            id: t.id,
            subject: t.subject,
            description: t.description,
            email: t.email,
            phone: t.phoneNumber || '',
            status: t.status as unknown as TicketStatus,
            priority: this.mapSeverityToPriority(t.severity),
            severity: t.severity,
            siteNameEn: t.siteNameEn,
            siteNameAr: t.siteNameAr,
            accountNameEn: t.accountNameEn,
            accountNameAr: t.accountNameAr,
            isInProducts: t.isInProducts,
            isInSupport: t.isInSupport,
            messages: [],
            createdAt: new Date(t.createdAt),
          }));

          this.ticketsSignal.set(mappedTickets);
        },
        error: (err) => console.error('Failed to load super admin tickets', err),
      });
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
        t.id === id ? { ...t, status: TicketStatus.Closed, updatedAt: new Date() } : t
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
