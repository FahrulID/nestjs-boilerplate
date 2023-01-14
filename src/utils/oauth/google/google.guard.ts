import { CanActivate, ExecutionContext, Injectable, BadRequestException, HttpException } from '@nestjs/common';
import axios from 'axios';
import { TokenBearerInterface } from '../../jwt/jwt.dto';

@Injectable()
export class GoogleAccessTokenGuard implements CanActivate {
  constructor(
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: TokenBearerInterface = context.switchToHttp().getRequest();
    const body = request.body;
    
    const valid = await this.validateToken(body.accessToken, request);
    const user = await this.getUserInfo(body.accessToken, request);

    if(user)
      request.tryGuard.resetTry();

    request.oauth = { user };

    return true;
  }
  
  async validateToken(accessToken: string, request: TokenBearerInterface): Promise<boolean> {
    try {
      const tokenInfo = await axios.get('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + accessToken,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }).then((res) => {
            return res.data;
      });

      if(tokenInfo.invalid_token)
        throw new BadRequestException('Invalid Token');

      if(tokenInfo.issued_to !== process.env.GOOGLE_CLIENT_ID)
        throw new BadRequestException('Invalid Client ID');

      return true;
    } catch (error) {
      request.tryGuard.addTry();
      throw new HttpException(error.response.statusText, error.response.status);
    }
  }

  async getUserInfo(accessToken: string, request: TokenBearerInterface): Promise<{email: string, first_name:string, last_name: string}> {
    try {
      const userInfo = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + accessToken,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }).then((res) => {
            return res.data;
      });

      return {
        email: userInfo.email,
        first_name: userInfo.given_name,
        last_name: userInfo.family_name,
      };
    } catch (error) {
      request.tryGuard.addTry();
      throw new HttpException(error.response.statusText, error.response.status);
    }
  }
}