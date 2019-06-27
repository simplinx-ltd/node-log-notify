/**
 * Common Api Errors
 */

export class ApiError {
  static notFound(message?: string, status?: number): HttpError {
    return new HttpError(message || 'Not Found', status || 404);
  }

  static serverError(message?: string, status?: number): HttpError {
    return new HttpError(message || 'Server Error', status || 500);
  }

  static accessError(message?: string, status?: number): HttpError {
    return new HttpError(message || 'Access Denied', status || 401);
  }
}


class HttpError extends Error {
  status: number;

  constructor(msg: string, status?: number) {
    super(msg);
    this.status = status || 500;
  }
}