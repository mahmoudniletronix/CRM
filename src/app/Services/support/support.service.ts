import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SupportTeamMember, SupportAction } from '../../Core/domain/models/support-team.model';
import {
  PaginatedSupportersResponse,
  SupportActivitiesResponse,
  CloseTicketRequest,
  RejectTicketRequest,
  GetSupportersParams,
} from '../../Core/domain/models/support/support.models';
import { Auth } from '../auth/auth';

@Injectable({ providedIn: 'root' })
export class SupportService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);

  private readonly _members = signal<SupportTeamMember[]>([]);
  readonly members = this._members.asReadonly();

  private readonly _actions = signal<SupportAction[]>([]);
  readonly actions = this._actions.asReadonly();

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Get all support team members with pagination
   */
  getAll(params?: GetSupportersParams): Observable<PaginatedSupportersResponse> {
    let httpParams = new HttpParams();

    if (params?.searchText) {
      httpParams = httpParams.set('SearchText', params.searchText);
    }
    if (params?.pageNumber) {
      httpParams = httpParams.set('PageNumber', params.pageNumber.toString());
    }
    if (params?.pageSize) {
      httpParams = httpParams.set('PageSize', params.pageSize.toString());
    }

    return this.http.get<PaginatedSupportersResponse>(`${environment.apiUrl}/api/Support/GetAll`, {
      params: httpParams,
    });
  }

  /**
   * Get activities for a specific supporter
   */
  getActivities(supporterId: string): Observable<SupportActivitiesResponse> {
    return this.http.get<SupportActivitiesResponse>(
      `${environment.apiUrl}/api/Support/Activities`,
      { params: { id: supporterId } },
    );
  }

  /**
   * Close a ticket
   */
  closeTicket(request: CloseTicketRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/Support/CloseTicket`, request);
  }

  /**
   * Reject a ticket
   */
  rejectTicket(request: RejectTicketRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/Support/RejectTicket`, request);
  }

  /**
   * Get all support team members from API (legacy method for backward compatibility)
   */
  getSupporters(): Observable<{ email: string; id: string; fullName: string }[]> {
    return this.http.get<{ email: string; id: string; fullName: string }[]>(
      `${environment.apiUrl}/api/Account/GetSupporters`,
    );
  }

  /**
   * Add a new support team member
   */
  addSupportMember(member: any): Observable<any> {
    const payload = {
      email: member.email,
      password: member.password,
      phoneNumber: member.phoneNumber,
    };

    return this.http.post(`${environment.apiUrl}/api/Support`, payload).pipe(
      tap((response: any) => {
        const newMember: SupportTeamMember = {
          id: response.id || `agent_${Date.now()}`,
          fullName: member.fullName || response.fullName || 'New Agent',
          email: member.email,
          isActive: true,
          phoneNumber: member.phoneNumber,
          actions: [],
        };
        this._members.update((m) => [...m, newMember]);
        this.saveToStorage();
      }),
    );
  }

  /**
   * Log an action taken by a support team member
   */
  logAction(
    ticketId: string,
    ticketSubject: string,
    actionType: SupportAction['actionType'],
    details: string,
  ): void {
    const user = this.auth.currentUser();
    if (!user || (user.role !== 'SupportTeam' && user.role !== 'SuperAdmin')) return;

    const action: SupportAction = {
      id: `act_${Date.now()}`,
      agentId: user.id,
      agentName: user.fullName,
      ticketId,
      ticketSubject,
      actionType,
      details,
      timestamp: new Date(),
    };

    this._actions.update((a) => [action, ...a]);

    // Update member list with last action
    this._members.update((members) =>
      members.map((m) =>
        m.id === user.id ? { ...m, lastAction: action, actions: [action, ...m.actions] } : m,
      ),
    );

    this.saveToStorage();
  }

  /**
   * Get actions for a specific agent
   */
  getAgentActions(agentId: string): SupportAction[] {
    return this._actions().filter((a) => a.agentId === agentId);
  }

  private saveToStorage(): void {
    localStorage.setItem('crm_support_members', JSON.stringify(this._members()));
    localStorage.setItem('crm_support_actions', JSON.stringify(this._actions()));
  }

  private loadFromStorage(): void {
    const savedMembers = localStorage.getItem('crm_support_members');
    const savedActions = localStorage.getItem('crm_support_actions');

    if (savedMembers) {
      this._members.set(JSON.parse(savedMembers));
    }

    if (savedActions) {
      this._actions.set(
        JSON.parse(savedActions).map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) })),
      );
    }
  }
}
