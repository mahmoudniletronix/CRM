import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ClientsTableComponent } from './components/clients-table-component/clients-table-component';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Auth } from '../../Services/auth/auth';
import { ClientCreateComponent } from '../Client-Management/components/client-create/client-create-component';
import { DashboardService } from '../../Services/dashboard/dashboard.service';
import { ElementRef, ViewChild } from '@angular/core';
import { DashboardStats } from '../../Core/domain/models/Dashboard KPI/DashboardStats.model';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    ClientsTableComponent,
    RouterLink,
  ],

  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly authService = inject(Auth);
  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);

  @ViewChild('renewalSection', { read: ElementRef }) renewalSection!: ElementRef;

  readonly user = this.authService.currentUser;

  readonly stats = signal<DashboardStats>({
    totalClients: 0,
    totalPendingTickets: 0,
    totalAssignedTickets: 0,
    totalClosedTickets: 0,
    totalProductsEndedWithing30Days: 0,
    ttoalProductsEnded: 0,
  });

  readonly totals = computed(() => {
    return {
      clients: this.stats().totalClients,
      pending: this.stats().totalPendingTickets,
      assigned: this.stats().totalAssignedTickets,
      closed: this.stats().totalClosedTickets,
      renewals: this.stats().totalProductsEndedWithing30Days,
      expired: this.stats().ttoalProductsEnded,
    };
  });

  ngOnInit(): void {
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.animateStats(data);
      },
      error: (err) => console.error('Failed to load dashboard stats', err),
    });
  }

  scrollToRenewals() {
    this.renewalSection?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
  }

  private animateStats(target: DashboardStats) {
    const duration = 1500; // 1.5 seconds
    const startValues = { ...this.stats() };
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out quart
      const ease = 1 - Math.pow(1 - progress, 4);

      this.stats.set({
        totalClients: Math.floor(
          startValues.totalClients + (target.totalClients - startValues.totalClients) * ease
        ),
        totalPendingTickets: Math.floor(
          startValues.totalPendingTickets +
            (target.totalPendingTickets - startValues.totalPendingTickets) * ease
        ),
        totalAssignedTickets: Math.floor(
          startValues.totalAssignedTickets +
            (target.totalAssignedTickets - startValues.totalAssignedTickets) * ease
        ),
        totalClosedTickets: Math.floor(
          startValues.totalClosedTickets +
            (target.totalClosedTickets - startValues.totalClosedTickets) * ease
        ),
        totalProductsEndedWithing30Days: Math.floor(
          startValues.totalProductsEndedWithing30Days +
            (target.totalProductsEndedWithing30Days - startValues.totalProductsEndedWithing30Days) *
              ease
        ),
        ttoalProductsEnded: Math.floor(
          startValues.ttoalProductsEnded +
            (target.ttoalProductsEnded - startValues.ttoalProductsEnded) * ease
        ),
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Ensure final values are set exactly
        this.stats.set(target);
      }
    };

    requestAnimationFrame(animate);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
