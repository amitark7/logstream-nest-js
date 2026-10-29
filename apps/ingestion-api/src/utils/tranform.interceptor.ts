import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Response } from 'express';
import { map, Observable } from 'rxjs';

@Injectable()
export class TranformInterceptor<T> implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getResponse<Response>()
    const statusCode = req.statusCode ?? '200'
    return next.handle().pipe(
      map((data: T) => ({
        success:true,
        statusCode:statusCode,
        message:"Success",
        data
      }))
    );
  }
}
