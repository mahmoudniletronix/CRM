import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { SitesService } from '../../../../Services/sites/sites.service';
import { Auth } from '../../../../Services/auth/auth';
import { Site } from '../../../../Core/domain/models/site.model/site.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-account-sites',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatExpansionModule],
  templateUrl: './account-sites.component.html',
  styleUrls: ['./account-sites.component.css'],
})
export class AccountSitesComponent implements OnInit {
  private readonly sitesService = inject(SitesService);
  private readonly auth = inject(Auth);

  readonly sites = this.sitesService.sites;
  readonly loading = signal(true);
  readonly activeTab = signal<'sites' | 'products'>('sites');
  readonly expandedSiteId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadSites();
  }

  loadSites(): void {
    this.loading.set(true);
    this.sitesService.getSites().subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load sites', err);
        this.loading.set(false);
      },
    });
  }

  toggleSite(siteId: string): void {
    if (this.expandedSiteId() === siteId) {
      this.expandedSiteId.set(null);
    } else {
      this.expandedSiteId.set(siteId);
    }
  }

  isSiteExpanded(siteId: string): boolean {
    return this.expandedSiteId() === siteId;
  }

  getStatusLabel(status: number): string {
    const statusMap: { [key: number]: string } = {
      1: 'Open',
      2: 'In Progress',
      3: 'Resolved',
      4: 'Closed',
    };
    return statusMap[status] || 'Unknown';
  }

  getStatusColor(status: number): string {
    const colorMap: { [key: number]: string } = {
      1: '#3b82f6',
      2: '#f59e0b',
      3: '#10b981',
      4: '#6b7280',
    };
    return colorMap[status] || '#6b7280';
  }

  getSeverityLabel(severity: number): string {
    const severityMap: { [key: number]: string } = {
      1: 'Low',
      2: 'Medium',
      3: 'High',
      4: 'Urgent',
    };
    return severityMap[severity] || 'Unknown';
  }

  getSeverityColor(severity: number): string {
    const colorMap: { [key: number]: string } = {
      1: '#10b981',
      2: '#f59e0b',
      3: '#ef4444',
      4: '#dc2626',
    };
    return colorMap[severity] || '#6b7280';
  }
}
