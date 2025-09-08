export interface ApiResponse<T> {
    endpoint: string;
    statusCode: number;
    status: string;
    success: boolean;
    message: string;
    pagination?: {
        page: number;
        maxPage: number;
        limit: number;
        count: number;
        countAll: number;
    };
    data: T;
}