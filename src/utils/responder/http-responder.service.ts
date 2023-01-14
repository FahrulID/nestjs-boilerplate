import { HttpStatus, Injectable } from '@nestjs/common';
import { HttpResponse } from './http-response.type';

@Injectable()
export class HttpResponderService {
  constructor() {}
  
  async successWithData(data: any, statusCode: number = HttpStatus.OK, message: string = 'Success'): Promise<HttpResponse> {
    return {
      success: true,
      statusCode,
      message,
      data,
    };
  }

  async successWithoutData(statusCode: number = HttpStatus.OK, message: string = 'Success'): Promise<HttpResponse> {
    return {
      success: true,
      statusCode,
      message,
    };
  }
}