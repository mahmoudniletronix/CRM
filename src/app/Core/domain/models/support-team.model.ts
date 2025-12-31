export interface SupportAction {
  id: string;
  agentId: string;
  agentName: string;
  ticketId: string;
  ticketSubject: string;
  actionType: 'reply' | 'status_change' | 'priority_change' | 'view';
  details: string;
  timestamp: Date;
}

export interface SupportTeamMember {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  lastAction?: SupportAction;
  actions: SupportAction[];
}
