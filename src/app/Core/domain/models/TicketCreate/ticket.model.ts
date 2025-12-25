export interface TicketCreatePayload {
  description: string;
  email: string;
  subject: string;
  phoneNumber?: string | null;
  severity: number; // enum numeric
  siteId: string; // Guid as string
  productId: string; // Guid as string
  attachments?: File[];
}
