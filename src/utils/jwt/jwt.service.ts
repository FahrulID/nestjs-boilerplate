import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as NestJwt from '@nestjs/jwt';
import * as JWT from "jsonwebtoken";
import { SHA256Service } from '../hash/sha256.service';
import { AccessTokenMainPayload, AccessTokenPayload, MailVerificationTokenPayload, RefreshTokenMainPayload, RefreshTokenPayload } from './jwt.type';
import ms from 'ms';

@Injectable()
export class JwtService {
  constructor(
    private readonly NestJwtService: NestJwt.JwtService,
    private readonly SHA256: SHA256Service
  ) {}

  async validateBearerToken(bearer: string): Promise<Boolean> {
    try {
      if (bearer.split(' ').length != 2 || bearer.split(' ')[0] !== 'Bearer')
        throw new HttpException('Invalid Token Bearer', HttpStatus.UNAUTHORIZED);

      return true;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  async getTokenFromBearer(bearer: string): Promise<string> {
    try {
      await this.validateBearerToken(bearer);
      return bearer.split(' ')[1];
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  async verifyToken(token: string, secret: string): Promise<Boolean> {
    try {
      return await this.NestJwtService.verify(token,  {
        secret
      });
    } catch (error) {

      if (error instanceof JWT.TokenExpiredError) {
        throw new HttpException('Token expired', HttpStatus.UNAUTHORIZED);
      }

      if (error instanceof JWT.JsonWebTokenError) {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }

      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  async verifyRaw(token: string, privateKey: string, fingerprint: string): Promise<Boolean> {
    try {
      const secret = this.SHA256.hash(privateKey + fingerprint);
      return await this.NestJwtService.verify(token,  {
        secret
      });
    } catch (error) {

      if (error instanceof JWT.TokenExpiredError) {
        throw new HttpException('Token expired', HttpStatus.UNAUTHORIZED);
      }

      if (error instanceof JWT.JsonWebTokenError) {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }

      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  async decodeRefreshToken(token: string, fingerprint: string): Promise<RefreshTokenPayload> {
    try {
      const secret = this.SHA256.hash(process.env.REFRESH_TOKEN_SECRET + fingerprint);
      await this.verifyToken(token, secret);
      return this.NestJwtService.decode(token, { json: true }) as RefreshTokenPayload;
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async decodeAccessToken(token: string, fingerprint: string): Promise<AccessTokenPayload> {
    try {
      const secret = this.SHA256.hash(process.env.ACCESS_TOKEN_SECRET + fingerprint);
      await this.verifyToken(token, secret);
      return this.NestJwtService.decode(token, { json: true }) as AccessTokenPayload;
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async generateAccessToken(payload: AccessTokenMainPayload, fingerprint: string): Promise<string> {
    try {
      const secret = this.SHA256.hash(process.env.ACCESS_TOKEN_SECRET + fingerprint);
      return this.NestJwtService.sign(payload, {
        secret,
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      });
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async generateRefreshToken(payload: RefreshTokenMainPayload, fingerprint: string): Promise<string> {
    try {
      const secret = this.SHA256.hash(process.env.REFRESH_TOKEN_SECRET + fingerprint);
      return this.NestJwtService.sign(payload, {
        secret,
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      });
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async expiresInToMS(expiresIn: string): Promise<number> {
    try {
      return ms(expiresIn);
    }
    catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
