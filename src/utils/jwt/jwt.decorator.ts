import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { TokenBearerInterface } from './jwt.dto';
import { AccessTokenPayload } from './jwt.type';
  
export const AccessToken = createParamDecorator(async (data: string, ctx: ExecutionContext) => {
    const request: TokenBearerInterface = ctx.switchToHttp().getRequest();
    const accessTokenPayload: AccessTokenPayload = request.accessTokenPayload;

    return data ? accessTokenPayload?.[data] : false;
  },
);