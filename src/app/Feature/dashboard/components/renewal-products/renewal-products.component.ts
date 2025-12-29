import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RenewalItem, RenewalService } from '../../../../Services/renewal/renewal.service';

@Component({
  selector: 'app-renewal-products',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatTabsModule,
    MatPaginatorModule,
    MatButtonToggleModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './renewal-products.component.html',
  styleUrls: ['./renewal-products.component.css'],
})
export class RenewalProductsComponent implements OnInit {
  private readonly renewalService = inject(RenewalService);

  readonly pendingRenewals = this.renewalService.pendingRenewals;
  readonly renewedProducts = this.renewalService.renewedProducts;
  readonly closedProducts = this.renewalService.closedProducts;
  readonly totalItems = this.renewalService.totalItems;
  readonly totalClosedItems = this.renewalService.totalClosedItems;

  readonly filterDays = signal<number>(30);
  readonly pageSize = signal<number>(10);
  readonly pageIndex = signal<number>(0);

  // Separate pagination for closed products tab
  readonly closedPageSize = signal<number>(10);
  readonly closedPageIndex = signal<number>(0);

  // Client-side filtering of the CURRENT PAGE data
  readonly filteredPendingRenewals = computed(() => {
    const days = this.filterDays();
    const items = this.pendingRenewals();

    // The API sends items expiring within 30 days.
    // If the user selects 5 or 15, we filter the received batch.
    // Note: Ideally, the API would support filtering, but user instructions imply UI filtering "such that he chooses to display what ends in 5, 15, 30".
    if (days === 30) return items;
    return items.filter((item) => item.daysRemaining <= days);
  });

  readonly displayedColumns: string[] = [
    'accountName',
    'siteName',
    'productName',
    'daysRemaining',
    'supportEndDate',
  ];

  // Closed products don't have editable dates, so we use different columns
  readonly closedProductsColumns: string[] = [
    'accountName',
    'siteName',
    'productName',
    'daysRemaining',
    'supportEndDate',
  ];

  protected readonly Math = Math;

  ngOnInit() {
    this.loadData();
    this.loadClosedData();
  }

  loadData() {
    // API uses 1-based indexing usually, Angular Paginator uses 0-based
    this.renewalService.loadRenewalProducts(this.pageIndex() + 1, this.pageSize());
  }

  loadClosedData() {
    this.renewalService.loadClosedProducts(this.closedPageIndex() + 1, this.closedPageSize());
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadData();
  }

  onClosedPageChange(event: PageEvent) {
    this.closedPageIndex.set(event.pageIndex);
    this.closedPageSize.set(event.pageSize);
    this.loadClosedData();
  }

  onFilterChange(days: number) {
    this.filterDays.set(days);
    // If we wanted to reload from API with new filter, we would do it here.
    // Currently implementing client-side filter on top of the generic "Within30Days" API call.
  }

  getDaysStatusClass(days: number): string {
    if (days < 0) return 'expired';
    if (days <= 30) return 'urgent';
    return 'warning';
  }

  onDateChange(item: RenewalItem, event: any) {
    if (event.value) {
      this.renewalService.updateProductDate(item, event.value);
    }
  }
}
