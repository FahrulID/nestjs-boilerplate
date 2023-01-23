import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpResponse } from '../responder/http-response.type';

@Injectable()
export class HttpResponseInterceptor<T> implements NestInterceptor<T, HttpResponse> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<HttpResponse> {
    return next.handle()
    .pipe(
      map((data) => {
          const response = context.switchToHttp().getResponse();
          response.status(data?.statusCode || context.switchToHttp().getResponse().statusCode || 200);
          var Response: HttpResponse = { 
            statusCode: context.switchToHttp().getResponse().statusCode,
            success: true,
            message: data.message || 'Success',
          };

          if(data.data)
            Response.data = data.data;

          return Response;
        }
      )
    );
  }
}