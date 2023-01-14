import { Body, Controller, Get, HttpException, HttpStatus, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TryType, User } from '@prisma/client';
import { JwtService } from '../../utils/jwt/jwt.service';
import { HttpResponderService } from '../../utils/responder/http-responder.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { RefreshTokenPayload } from '../../utils/jwt/jwt.type';
import { RefreshTokenDto, TokenBearerInterface } from '../../utils/jwt/jwt.dto';
import { AccessTokenGuard } from '../../utils/jwt/jwt.guard';
import { AccessToken } from '../../utils/jwt/jwt.decorator';
import { TryGuard } from '../../utils/try/try.guard';
import { EditDto } from './dtos/edit.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { GoogleAccessTokenGuard } from '../../utils/oauth/google/google.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly response: HttpResponderService,
  ) {}
  
  @Post('/register')
  async register(@Body() User: RegisterDto)
  {
    try {
      await this.authService.register(User);
      return await this.response.successWithoutData(HttpStatus.CREATED, "Registration successful");
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(GoogleAccessTokenGuard) // Remember, this comes after the TryGuard, follow this order
  @UseGuards(TryGuard(TryType.LOGIN, 3, 1000 * 15)) // 15 seconds
  @Post('google/login')
  async google(@Req() req: TokenBearerInterface)
  {
    try {
      const user: User = await this.authService.loginWithGoogle(req.oauth.user);
      const tokens = await this.authService.generateTokens(user, req.headers['user-agent'] as string);

      return await this.response.successWithData(tokens, HttpStatus.OK, "Successfully logged in");
    } catch(error) {
      throw new HttpException(error.message, error.status);
    }
  }
  
  @UseGuards(TryGuard(TryType.LOGIN, 3, 1000 * 15)) // 15 seconds
  @Post('/login')
  async login(@Body() User: LoginDto, @Req() req: TokenBearerInterface)
  {
    try {
      const user: User = await this.authService.login(User);
      const tokens = await this.authService.generateTokens(user, req.headers['user-agent'] as string);

      if(user)
        req.tryGuard.resetTry();

      return await this.response.successWithData(tokens, HttpStatus.OK, "Successfully logged in");
    } catch (error) {
      req.tryGuard.addTry();
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('/refresh')
  async refresh(@Body() body: RefreshTokenDto, @Req() req: Request)
  {
    try {
      const refreshTokenPayload: RefreshTokenPayload = await this.jwtService.decodeRefreshToken(body.refreshToken, req.headers['user-agent'] as string);

      const user: User = await this.authService.me(refreshTokenPayload.uid);
      const tokens = await this.authService.refreshTokens(body.refreshToken, user, req.headers['user-agent'] as string);

      return await this.response.successWithData(tokens, HttpStatus.OK, "Successfully refreshed tokens");
    }
    catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AccessTokenGuard)
  @Get('/me')
  async me(@AccessToken("uid") uid: string)
  {
    try {
      const user: User = await this.authService.me(uid);

      return await this.response.successWithData(user, HttpStatus.OK, "Successfully get current user data");
    }
    catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(AccessTokenGuard)
  @Patch('/me')
  async editMe(@AccessToken("uid") uid: string, @Body() User: EditDto)
  {
    try {
      const user: User = await this.authService.editUser(uid, User);

      return await this.response.successWithData(user, HttpStatus.OK, "Successfully update current user data");
    }
    catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(TryGuard(TryType.EMAIL_VERIFICATION, 1, 1000 * 60 * 1)) // 1 minutes
  @Post('/verify')
  async sendVerification(@Query("email") email: string, @Req() req: TokenBearerInterface)
  {
    try {
      const success = await this.authService.sendVerificationMail(email);

      if(success)
        req.tryGuard.addTry();

      return await this.response.successWithoutData(HttpStatus.OK, "Verification email successfully sent");
    }
    catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(TryGuard(TryType.EMAIL_VERIFICATION, 3, 1000 * 15)) // 15 seconds
  @Patch('/verify')
  async verify(@Req() req: TokenBearerInterface, @Query("token") token: string, @Query("email") email: string)
  {
    try {
      const success = await this.authService.verifyMail(email, token)

      if(success)
        req.tryGuard.resetTry();

      return await this.response.successWithoutData(HttpStatus.OK, "Successfully verified");
    }
    catch (error) {
      req.tryGuard.addTry();
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(TryGuard(TryType.FORGOT_PASSWORD, 1, 1000 * 60)) // 1 minutes
  @Post('/forgot-password')
  async sendForgotPassword(@Query("email") email: string, @Req() req: TokenBearerInterface)
  {
    try {
      const success = await this.authService.sendForgotPasswordMail(email);

      if(success)
        req.tryGuard.addTry();

      return await this.response.successWithoutData(HttpStatus.OK, "Verification email successfully sent");
    }
    catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @UseGuards(TryGuard(TryType.FORGOT_PASSWORD, 3, 1000 * 15)) // 15 seconds
  @Patch('/forgot-password')
  async changePassword(@Body() User: ForgotPasswordDto, @Req() req: TokenBearerInterface)
  {
    try {
      const success = await this.authService.verifyForgot(User)

      if(success)
        req.tryGuard.resetTry();

      return await this.response.successWithoutData(HttpStatus.OK, "Successfully verified");
    }
    catch (error) {
      req.tryGuard.addTry();
      throw new HttpException(error.message, error.status);
    }
  }
}
