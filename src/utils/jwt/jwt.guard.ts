import { CanActivate, ExecutionContext, Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenBearerInterface } from './jwt.dto';
import { JwtService } from './jwt.service';
@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: TokenBearerInterface = context.switchToHttp().getRequest();

    const bearer = request.headers?.authorization ?? null;
    const fingerprint = request.headers['user-agent'] ?? null;

    if (!bearer)
      throw new ForbiddenException('Token Bearer is required');

    if(!fingerprint)
      throw new BadRequestException('Request Header is malformed');

    const accessToken = await this.jwtService.getTokenFromBearer(bearer);
    const accessTokenPayload = await this.jwtService.decodeAccessToken(accessToken, fingerprint);

    request.accessTokenPayload = accessTokenPayload;

    return await this.validateToken(bearer, fingerprint) as boolean;
  }
  
  async validateToken(bearer: string, fingerprint: string): Promise<Boolean> {
    try {
      const token = await this.jwtService.getTokenFromBearer(bearer)
      return await this.jwtService.verifyRaw(token, process.env.ACCESS_TOKEN_SECRET, fingerprint) ?? false;
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }
}