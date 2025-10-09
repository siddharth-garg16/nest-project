export interface PaginationMetaFormat {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginationResponse<T> {
  items: T[];
  meta: PaginationMetaFormat;
}
