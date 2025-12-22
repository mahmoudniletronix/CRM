export interface ApiResponse<T> {
  isSuccess: boolean;
  data?: T;
  errors?: { message: string; code?: string; fieldName?: string }[];
}
    