import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data: T) => {
        const statusCode = response.statusCode || 200;
        const message =
          data && typeof data === 'object' && 'message' in data
            ? (data as Record<string, unknown>).message as string
            : undefined;

        const cleanData =
          data && typeof data === 'object' && 'message' in data
            ? this.stripMessage(data as Record<string, unknown>)
            : data;

        return {
          success: true,
          data: cleanData as T,
          message: message || this.getDefaultMessage(statusCode),
          statusCode,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }

  private getDefaultMessage(statusCode: number): string {
    switch (statusCode) {
      case 200:
        return 'OK';
      case 201:
        return 'Created successfully';
      case 204:
        return 'No Content';
      default:
        return 'Success';
    }
  }

  private stripMessage(obj: Record<string, unknown>): Record<string, unknown> {
    const { message, ...rest } = obj;
    return rest;
  }
}