export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface PaginatedResult<T> {
    data: T[];
    meta: PaginationMeta;
}
export interface PaginationQuery {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: string;
}
//# sourceMappingURL=pagination.types.d.ts.map