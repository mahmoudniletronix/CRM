export interface ProductSupportDto {
  productId: string;
  supportEndDate: string;  
}

export interface AccountSiteDto {
  nameEn: string;
  nameAr: string;
  products: ProductSupportDto[];
}

export interface AddAccountRequestDto {
  email: string;
  password: string;
  sites: AccountSiteDto[];
  nameEn: string;
  nameAr: string;
}

export interface AccountProductResponseDto {
  id: string;
  nameEn: string;
  supportDateEnd: string;
}

export interface AccountSiteResponseDto {
  id: string;
  nameEn: string;
  nameAr: string;
  products: AccountProductResponseDto[];
}

export interface AccountDto {
  id: string;
  nameEn: string;
  nameAr: string;
  sites: AccountSiteResponseDto[];
}

export interface PagedResponse<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  data: T[];
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApiError {
  message?: string;
  code?: string;
  fieldName?: string;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data?: T;
  errors?: ApiError[];
}
