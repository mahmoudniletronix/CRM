export interface AccountSiteDto {
  nameEn: string;
  nameAr: string;
}

export interface AddAccountRequestDto {
  email: string;
  password: string;
  nameEn: string;
  nameAr: string;
  sites: AccountSiteDto[];
}

export interface AccountDto {
  id: string;
  nameEn: string;
  nameAr: string;
  sites: any[];
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
