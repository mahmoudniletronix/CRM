export enum TicketStatus {
  Open = 'Open',
  InProgress = 'InProgress',
  Resolved = 'Resolved',
  Closed = 'Closed',
}

export enum TicketPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Urgent = 'Urgent',
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
