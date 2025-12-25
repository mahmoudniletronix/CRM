export enum TicketStatus {
  Pending = 1,
  Assigned = 2,
  Closed = 3,
  Rejected = 4,
}

export enum TicketPriority {
  Low = 1,
  Medium = 2,
  High = 3,
  Urgent = 4,
}

export type MessageSender = 'client' | 'agent' | 'system';

export interface TicketMessage {
  id: string;
  content: string;
  sender: MessageSender;
  createdAt: Date;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  email: string;
  phone: string;
  status: TicketStatus;
  priority: TicketPriority;
  messages: TicketMessage[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateTicketDto {
  subject: string;
  description: string;
  email: string;
  phone: string;
  priority?: TicketPriority;
}

export interface TicketCreatePayload {
  description: string;
  email: string;
  subject: string;
  phoneNumber?: string | null;
  severity: number;
  siteId: string; // Guid as string
  productId: string; // Guid as string
  attachments?: File[];
}
