export type TicketStatus = 'pending' | 'assigned' | 'closed';
export type ClientStatus = 'active' | 'inactive' | 'pending';

export interface ClientTicketStats {
  pending: number;
  assigned: number;
  closed: number;
}

export interface Client {
  id: number;
  accountName: string;
  siteName: string;
  name: string;
  email: string;
  phoneNumber: string;
  status: ClientStatus;
  ticketStats: ClientTicketStats;
  assignedDate?: string;
  closedDate?: string;
}
