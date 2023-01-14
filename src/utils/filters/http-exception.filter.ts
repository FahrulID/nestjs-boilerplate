import {
    ExceptionFilter,
    Catch,
    HttpException,
    ArgumentsHost,
  } from '@nestjs/common';
import { isObject } from '@nestjs/class-validator';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionHandler implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    let msg = exception.getResponse();

    if (isObject(msg)) {
      response.status(status).json({
        statusCode: status,
        success: false,
        message: status >= 500 ? 'Internal Server Error' : msg['message'] || "Something went wrong",
        // message: msg['message'] || "Something went wrong", Use This if you want to show the error message
      });
    } else {
      response.status(status).json({
        statusCode: status,
        success: false,
        message: status >= 500 ? 'Internal Server Error' : msg || "Something went wrong",
        // message: msg || "Something went wrong", Use This if you want to show the error message
      });
    }
  }
}