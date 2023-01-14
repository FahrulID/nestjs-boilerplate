import { Request } from 'express';
import { AccessTokenPayload } from './jwt.type';

export interface TokenBearerInterface extends Request {
  headers: {
    authorization: string;
  };
  accessTokenPayload?: AccessTokenPayload;
  query: {
    code?: string; // Verification Mail Code
    email?: string; // Verification Mail Email
  };
  tryGuard?: {
    addTry?: () => Promise<void>; // For TryGuard
    resetTry?: () => Promise<void>; // For TryGuard
  }
  oauth?: {
    user: {
      email: string; 
      first_name: string; 
      last_name: string;
    }
  }
}

export interface RefreshTokenDto {
  refreshToken: string;
}