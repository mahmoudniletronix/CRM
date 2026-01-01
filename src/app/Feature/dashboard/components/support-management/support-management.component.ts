import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupportService } from '../../../../Services/support/support.service';
import {
  SupportTeamMember,
  SupportAction,
} from '../../../../Core/domain/models/support-team.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-support-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTableModule,
    MatDividerModule,
    MatChipsModule,
    RouterLink,
  ],
  templateUrl: './support-management.component.html',
  styleUrl: './support-management.component.css',
})
export class SupportManagementComponent {
  private readonly fb = inject(FormBuilder);
  private readonly supportService = inject(SupportService);

  readonly members = this.supportService.members;
  readonly allActions = this.supportService.actions;

  readonly teamStats = computed(() => {
    const actions = this.allActions();
    const members = this.members();

    // Count status changes as "solved" for demonstration
    const solvedCount = actions.filter((a) => a.actionType === 'status_change').length;
    const replyCount = actions.filter((a) => a.actionType === 'reply').length;

    // Action Distribution for Chart
    const total = actions.length || 1;
    const distribution = [
      { type: 'Replies', count: replyCount, percent: (replyCount / total) * 100, color: '#3b82f6' },
      {
        type: 'Status',
        count: solvedCount,
        percent: (solvedCount / total) * 100,
        color: '#10b981',
      },
      {
        type: 'Other',
        count: total - replyCount - solvedCount,
        percent: ((total - replyCount - solvedCount) / total) * 100,
        color: '#f59e0b',
      },
    ];

    // Leaderboard
    const leaderboard = members
      .map((m) => ({
        id: m.id,
        name: m.fullName,
        count: actions.filter((a) => a.agentId === m.id).length,
        avatar: m.fullName.charAt(0),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalActions: actions.length,
      solvedTickets: solvedCount,
      activeAgents: members.filter((m) => m.isActive).length,
      topPerformer: leaderboard[0] || { name: 'None', count: 0 },
      distribution,
      leaderboard,
    };
  });

  readonly showAddForm = signal(false);
  readonly selectedMember = signal<SupportTeamMember | null>(null);

  readonly addForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['123456', [Validators.required, Validators.minLength(6)]],
    phoneNumber: ['', [Validators.required]],
  });

  toggleAddForm() {
    this.showAddForm.update((v) => !v);
    if (!this.showAddForm()) this.addForm.reset({ password: '123456' });
  }

  submitAdd() {
    if (this.addForm.invalid) return;

    this.supportService.addSupportMember(this.addForm.value).subscribe({
      next: () => {
        this.toggleAddForm();
      },
    });
  }

  selectMember(member: SupportTeamMember) {
    this.selectedMember.set(member);
  }

  closeDetails() {
    this.selectedMember.set(null);
  }

  getActionIcon(type: string): string {
    switch (type) {
      case 'reply':
        return 'reply';
      case 'status_change':
        return 'sync';
      case 'priority_change':
        return 'priority_high';
      default:
        return 'info';
    }
  }

  getActionColor(type: string): string {
    switch (type) {
      case 'reply':
        return '#3b82f6';
      case 'status_change':
        return '#10b981';
      case 'priority_change':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  }
}
