export interface RenewalApiResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  data: RenewalProductDto[];
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface RenewalProductDto {
  siteProductId: string;
  siteNameAr: string;
  siteNameEn: string;
  productNameAr: string;
  productNameEn: string;
  endDate: string;
  accountNameAr: string;
  accountNameEn: string;
}
