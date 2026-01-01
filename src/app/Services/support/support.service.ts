import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SupportTeamMember, SupportAction } from '../../Core/domain/models/support-team.model';
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
   * Get all support team members from API
   */
  getSupporters(): Observable<{ email: string; id: string; fullName: string }[]> {
    return this.http.get<{ email: string; id: string; fullName: string }[]>(
      `${environment.apiUrl}/api/Account/GetSupporters`
    );
  }

  /**
   * Add a new support team member (Simulated backend call)
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
      })
    );
  }

  /**
   * Log an action taken by a support team member
   */
  logAction(
    ticketId: string,
    ticketSubject: string,
    actionType: SupportAction['actionType'],
    details: string
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
        m.id === user.id ? { ...m, lastAction: action, actions: [action, ...m.actions] } : m
      )
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
    } else {
      this._members.set([
        {
          id: 'agent_1',
          fullName: 'Support Agent One',
          email: 'agent1@company.com',
          isActive: true,
          actions: [],
        },
        {
          id: 'agent_2',
          fullName: 'Support Agent Two',
          email: 'agent2@company.com',
          isActive: false,
          actions: [],
        },
        {
          id: 'agent_3',
          fullName: 'Ahmad Nile',
          email: 'ahmad@niletronix.com',
          isActive: true,
          actions: [],
        },
        {
          id: 'agent_4',
          fullName: 'Sara Hassan',
          email: 'sara@support.com',
          isActive: true,
          actions: [],
        },
      ]);
    }

    if (savedActions) {
      this._actions.set(
        JSON.parse(savedActions).map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) }))
      );
    }
  }
}
