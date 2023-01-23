import {
    ExceptionFilter,
    Catch,
    HttpException,
    ArgumentsHost,
    HttpStatus,
  } from '@nestjs/common';
import { isObject } from '@nestjs/class-validator';
import { Response } from 'express';
import { HttpResponse } from '../responder/http-response.type';

@Catch(HttpException)
export class HttpExceptionHandler implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;
    let msg = exception.getResponse();

    const filtered: HttpResponse = {
      statusCode: status,
      success: false,
      message: status >= 500 && status < 600 ? 'Internal Server Error' : (isObject(msg) ? msg['message'] : msg) || "Something went wrong",
    };

    response.status(status).json(filtered);

    if(status >= 500 && status < 600)
      console.error(exception);
  }
}