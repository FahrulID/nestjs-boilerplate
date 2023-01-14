import { CanActivate, ExecutionContext, mixin, Inject } from '@nestjs/common';
import { TryType } from '@prisma/client';
import { TokenBearerInterface } from '../jwt/jwt.dto';
import { JwtService } from '../jwt/jwt.service';
import { TryService } from './try.service';

export function TryGuard(type: TryType, max: number, maxTime: number) {
  
  class TryGuard implements CanActivate {
    constructor(
      @Inject(TryService) readonly tryService: TryService,
      @Inject(JwtService) readonly jwtService: JwtService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request: TokenBearerInterface = context.switchToHttp().getRequest();

      const ip: string = request.ip;

      // Set some useful functions so the Controller can do something about tries
      request.tryGuard = {
        addTry: async () => {
          await this.tryService.addTries(ip, type);
        },
        resetTry: async () => {
          await this.tryService.resetTries(ip, type);
        }
      };

      return await this.tryService.checkTries(ip, type, max, maxTime);
    }
  }

  return mixin(TryGuard);
}