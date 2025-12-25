import { Component, input, output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import {
  TicketPriority,
  TicketStatus,
} from '../../../../Core/domain/models/ticket.model/ticket.model';
import { MatIconModule } from '@angular/material/icon';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface TicketFilter {
  status: TicketStatus | 'All';
  priority: TicketPriority | 'All';
  searchQuery: string;
}

@Component({
  selector: 'app-ticket-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './ticket-filters.component.html',
  styleUrl: './ticket-filters.component.css',
})
export class TicketFiltersComponent implements OnInit, OnDestroy {
  readonly filtersData = input<TicketFilter>();
  readonly filterChange = output<TicketFilter>();

  filters: TicketFilter = {
    status: 'All',
    priority: 'All',
    searchQuery: '',
  };

  readonly statuses = Object.keys(TicketStatus)
    .filter((key) => isNaN(Number(key)))
    .map((key) => ({
      label: key,
      value: TicketStatus[key as keyof typeof TicketStatus],
    }));

  readonly priorities = Object.keys(TicketPriority)
    .filter((key) => isNaN(Number(key)))
    .map((key) => ({
      label: key,
      value: TicketPriority[key as keyof typeof TicketPriority],
    }));

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  ngOnInit() {
    if (this.filtersData()) {
      this.filters = { ...this.filtersData()! };
    }

    // Live search subscription
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.onFilterChange();
      });
  }

  ngOnDestroy() {
    this.searchSubscription?.unsubscribe();
  }

  onSearchInput(value: string) {
    this.filters.searchQuery = value;
    this.searchSubject.next(value);
  }

  onFilterChange() {
    this.filterChange.emit(this.filters);
  }

  resetFilters() {
    this.filters = { status: 'All', priority: 'All', searchQuery: '' };
    this.onFilterChange();
  }

  isDefaultFilters(): boolean {
    return (
      this.filters.status === 'All' && this.filters.priority === 'All' && !this.filters.searchQuery
    );
  }

  clearSearch() {
    this.filters.searchQuery = '';
    this.onFilterChange();
  }
}
