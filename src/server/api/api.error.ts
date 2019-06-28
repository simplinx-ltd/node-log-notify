/**
 * Common Api Errors
 */

export class ApiError {
    public static notFound(message?: string, status?: number): HttpError {
        return new HttpError(message || 'Not Found', status || 404);
    }

    public static serverError(message?: string, status?: number): HttpError {
        return new HttpError(message || 'Server Error', status || 500);
    }

    public static accessError(message?: string, status?: number): HttpError {
        return new HttpError(message || 'Access Denied', status || 401);
    }
}

class HttpError extends Error {
    private status: number;

    public constructor(msg: string, status?: number) {
        super(msg);
        this.status = status || 500;
    }
}
