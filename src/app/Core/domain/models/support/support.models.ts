// Support Team Models
export interface PaginatedSupportersResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  data: SupporterItem[];
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface SupporterItem {
  id: string;
  email: string;
  phone: string;
  assignedTicketCount: number;
  closedTicketCount: number;
}

export interface SupportActivitiesResponse {
  assignedCount: number;
  closedCount: number;
  rejectedCount: number;
}

export interface CloseTicketRequest {
  description: string;
  ticketId: string;
}

export interface RejectTicketRequest {
  rejectReason: string;
  ticketId: string;
}

export interface GetSupportersParams {
  searchText?: string;
  pageNumber?: number;
  pageSize?: number;
}
