export interface SiteTicketAttachment {
  id: string;
  url: string;
}

export interface SiteTicket {
  id: string;
  subject: string;
  description: string;
  email: string;
  phoneNumber: string | null;
  status: number;
  severity: number;
  attachments: SiteTicketAttachment[];
}

export interface SiteProduct {
  id: string;
  nameEn: string;
  nameAr: string;
  productImage: string;
  descriptionEn: string;
  descriptionAr: string;
}

export interface Site {
  id: string;
  nameEn: string;
  nameAr: string;
  products: SiteProduct[];
  tickets: SiteTicket[];
}

export interface SitesResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  data: Site[];
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
