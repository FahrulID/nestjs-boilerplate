import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User, VerificationType } from '@prisma/client';
import { Argon2Service } from '../../utils/hash/argon2.service';
import { SHA256Service } from '../../utils/hash/sha256.service';
import { JwtService } from '../../utils/jwt/jwt.service';
import { AccessTokenMainPayload, RefreshTokenMainPayload } from '../../utils/jwt/jwt.type';
import { MailService } from '../../utils/mail/mail.service';
import { PrismaService } from '../../utils/prisma/prisma.service';
import { EditDto } from './dtos/edit.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

enum VerifyType {
  TOKEN,
  JWT
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly argon2: Argon2Service,
    private readonly SHA256: SHA256Service,
    private readonly mail: MailService,
    private readonly jwtService: JwtService,
  ) {}

  //------------------------------User Authentication
  // Consists of.... TBD

  async register(User: RegisterDto): Promise<User>
  {
    try {
      const isUserExist = await this.userFromEmail(User.email);

      if (isUserExist) {
        throw new BadRequestException('Email already registered');
      }

      const hashedPassword = await this.argon2.hash(User.password);
      const user = await this.prisma.user.create({
        data: {
          ...User,
          password: hashedPassword,
        },
      });      

      delete user.password;

      await this.sendVerificationMail(user.email);

      return user;
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async loginWithGoogle(User: {email: string, first_name:string, last_name: string}): Promise<User>
  {
    try {
      const isUserExist = await this.userFromEmail(User.email);

      if (!isUserExist) {
        const user = await this.prisma.user.create({
          data: {
            ...User,
            phone: "",
            password: "",
            is_verified: true,
          },
        });

        delete user.password;
        return user;
      }

      delete isUserExist.password;
      return isUserExist;
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async login(User: LoginDto): Promise<User>
  {
    try {
      const user = await this.userFromEmail(User.email);

      if (!user)
        throw new BadRequestException('Email is not registered');

      if(!user.is_verified) 
        throw new BadRequestException('Email is not yet verified');

      if(!user.password)
        throw new BadRequestException('Password is not set');

      const isPasswordMatch = await this.argon2.compare(User.password, user.password);

      if (!isPasswordMatch) {
        throw new BadRequestException('Wrong password');
      }

      delete user.password;

      return user;
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //------------------------------User Authentication

  //------------------------------User Information
  // Consists of.... TBD

  async editUser(uid: string, User: EditDto): Promise<User>
  {
    try {
      const isEmailExists = this.userFromEmail(User.email);

      if(isEmailExists)
        throw new BadRequestException('Email already registered');

      const user = await this.prisma.user.update({
        where: {
          id: uid,
        },
        data: {
          ...User,
        },
      });

      delete user.password;

      return user;
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async me(uid: string): Promise<User>
  {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: uid,
        },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      delete user.password;

      return user;
    }
    catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async userFromEmail(email: string): Promise<User>
  {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      return user;
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //------------------------------User Information

  //------------------------------User Verification
  // Consists of.... TBD

  async sendVerificationMail(email: string): Promise<Boolean>
  {
    try {
      const user = await this.userFromEmail(email);

      if (!user)
        throw new BadRequestException('User not found');

      if(user.is_verified)
        throw new BadRequestException('Email is already verified');
      
      const context = await this.generateEmailToken(email);

      const success = await this.mail.sendVerificationMail(user.email, context);

      if(!success) {
        throw new BadRequestException('Failed to send verification mail');
      }

      return success;
    }
    catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async generateEmailToken(email: string): Promise<{token: string, expires: string}>
  {
    try {
      const user = await this.userFromEmail(email);

      if (!user)
        throw new BadRequestException('User not found');

      if(user.is_verified)
        throw new BadRequestException('Email is already verified');

      const token = this.randomBetween(0, 999999).toString().padStart(6, "0");

      const expiresIn = await this.jwtService.expiresInToMS(process.env.EMAIL_TOKEN_EXPIRES_IN);
      const expires_at = new Date(Date.now() + expiresIn);

      await this.prisma.email_Verification_Token.upsert({
        where: {
          user_id_type: {
            user_id: user.id,
            type: VerificationType.EMAIL_VERIFICATION 
          },
        },
        update: {
          token,
          expires_at,
        },
        create: {
          user_id: user.id,
          token,
          expires_at,
          type: VerificationType.EMAIL_VERIFICATION,
        },
      });

      return {
        token,
        expires: expires_at.toTimeString(),
      };

    } catch(error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyMail(email: string, verificationToken: string): Promise<Boolean>
  {
    try {
      const user = await this.userFromEmail(email);

      if (!user)
        throw new BadRequestException('User not found');

      if(user.is_verified)
        throw new BadRequestException('Email is already verified');

      const userToken = await this.prisma.email_Verification_Token.findUnique({
        where: {
          user_id_type: {
            user_id: user.id,
            type: VerificationType.EMAIL_VERIFICATION 
          },
        },
      });

      if(!userToken)
        throw new BadRequestException('Verification Token not found');

      if(userToken.token !== verificationToken)
        throw new BadRequestException('Verification Token is invalid');

      if(userToken.expires_at < new Date())
        throw new BadRequestException('Verification Token has expired');

      await this.prisma.user.update({
        where: {
          email: email,
        },
        data: {
          is_verified: true,
        },
      })

      await this.prisma.email_Verification_Token.delete({
        where: {
          user_id_type: {
            user_id: user.id,
            type: VerificationType.EMAIL_VERIFICATION 
          },
        },
      });

      return true;
    }
    catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async sendForgotPasswordMail(email: string): Promise<Boolean>
  {
    try {
      const user = await this.userFromEmail(email);

      if (!user)
        throw new BadRequestException('User not found');

      if(!user.is_verified) 
        throw new BadRequestException('Email is not yet verified');
      
      const context = await this.generateForgotToken(email);

      const success = await this.mail.sendForgotPasswordMail(user.email, context);

      if(!success) {
        throw new BadRequestException('Failed to send verification mail');
      }

      return success;
    }
    catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async generateForgotToken(email: string): Promise<{token: string, expires: string}>
  {
    try {
      const user = await this.userFromEmail(email);

      if (!user)
        throw new BadRequestException('User not found');

      if(!user.is_verified) 
        throw new BadRequestException('Email is not yet verified');

      const token = this.randomBetween(0, 999999).toString().padStart(6, "0");

      const expiresIn = await this.jwtService.expiresInToMS(process.env.FORGOT_TOKEN_EXPIRES_IN);
      const expires_at = new Date(Date.now() + expiresIn);

      await this.prisma.email_Verification_Token.upsert({
        where: {
          user_id_type: {
            user_id: user.id,
            type: VerificationType.FORGOT_PASSWORD 
          },
        },
        update: {
          token,
          expires_at,
        },
        create: {
          user_id: user.id,
          token,
          expires_at,
          type: VerificationType.FORGOT_PASSWORD,
        },
      });

      return {
        token,
        expires: expires_at.toTimeString(),
      };

    } catch(error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyForgot(User: ForgotPasswordDto): Promise<Boolean>
  {
    try {
      const user = await this.userFromEmail(User.email);

      if (!user)
        throw new BadRequestException('User not found');

      if(!user.is_verified) 
        throw new BadRequestException('Email is not yet verified');

      const userToken = await this.prisma.email_Verification_Token.findUnique({
        where: {
          user_id_type: {
            user_id: user.id,
            type: VerificationType.FORGOT_PASSWORD 
          },
        },
      });

      if(!userToken)
        throw new BadRequestException('Verification Token not found');

      if(userToken.token !== User.token)
        throw new BadRequestException('Verification Token is invalid');

      if(userToken.expires_at < new Date())
        throw new BadRequestException('Verification Token has expired');

      const hashedPassword = await this.argon2.hash(User.password);

      if(await this.argon2.compare(User.password, user.password))
        throw new BadRequestException('New password cannot be same as old password');

      await this.prisma.user.update({
        where: {
          email: User.email,
        },
        data: {
          password: hashedPassword,
        },
      })

      await this.prisma.email_Verification_Token.delete({
        where: {
          user_id_type: {
            user_id: user.id,
            type: VerificationType.FORGOT_PASSWORD 
          },
        },
      });

      return true;
    }
    catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  //------------------------------User Verification

  //------------------------------User OAUTH2.0
  // Consists of.... TBD

  async generateTokens(user: User, fingerprint: string): Promise<{ accessToken: string, refreshToken: string }>
  {
    try {
      const refreshTokenPayload: RefreshTokenMainPayload = {
        uid: user.id,
      };
      const accesTokenPayload: AccessTokenMainPayload = {
        uid: user.id,
        email: user.email,
        role: user.role,
      };
      const accessToken = await this.jwtService.generateAccessToken(accesTokenPayload, fingerprint);
      const refreshToken = await this.jwtService.generateRefreshToken(refreshTokenPayload, fingerprint);
      const hashedRefreshToken = await this.SHA256.hash(refreshToken);

      await this.prisma.refresh_Token_Rotation.upsert({
        where: {
          user_id_refresh_token: {
            user_id: user.id,
            refresh_token: hashedRefreshToken,
          },
        },
        update: {
          refresh_token: hashedRefreshToken,
        },
        create: {
          user_id: user.id,
          refresh_token: hashedRefreshToken,
        },
      });

      return { accessToken, refreshToken };
    } 
    catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async refreshTokens(refreshToken: string, user: User, fingerprint: string): Promise<{ accessToken: string, refreshToken: string }>
  {
    try {
      const hashedRefreshToken = await this.SHA256.hash(refreshToken);
      const RefreshTokenRotation = await this.prisma.refresh_Token_Rotation.findUnique({
        where: {
          user_id_refresh_token: {
            user_id: user.id,
            refresh_token: hashedRefreshToken,
          },
        },
      });

      if(!RefreshTokenRotation)
      {
        await this.prisma.refresh_Token_Rotation.deleteMany({
          where: {
            user_id: user.id,
          },
        });
        throw new BadRequestException('There is no existing session of Refresh Token');
      }

      await this.prisma.refresh_Token_Rotation.delete({
        where: {
          user_id_refresh_token: {
            user_id: user.id,
            refresh_token: hashedRefreshToken,
          },
        },
      });

      return await this.generateTokens(user, fingerprint);
    } 
    catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //------------------------------User OAUTH2.0

  //------------------------------Additional functions

  randomBetween(min: number, max: number): number {  
    return Math.floor(
      Math.random() * (max - min + 1) + min
    )
  }

  //------------------------------Additional functions
}
