import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

type verificationMailContext = {
  token: string,
  expires: string,
}

type forgotPasswordMailContext = {
  token: string,
  expires: string,
}

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService
  ) {}

  async sendVerificationMail(to: string, context: verificationMailContext): Promise<Boolean>
  {
    return await this
      .mailerService
      .sendMail({
        to,
        subject: 'Email Verification for NestJS-Boilerplate',
        template: 'email-verification', // The `.pug` or `.hbs` extension is appended automatically.
        context,  // Data to be sent to template engine.
      })
      .then((success) => {
        return true;
      })
      .catch((err) => {
        throw new HttpException(err.message, err.status || HttpStatus.INTERNAL_SERVER_ERROR);
      });
  }

  async sendForgotPasswordMail(to: string, context: forgotPasswordMailContext): Promise<Boolean>
  {
    return await this
      .mailerService
      .sendMail({
        to,
        subject: 'Forgot Password for NestJS-Boilerplate',
        template: 'forgot-password',
        context,
      })
      .then((success) => {
        return true;
      })
      .catch((err) => {
        throw new HttpException(err.message, err.status || HttpStatus.INTERNAL_SERVER_ERROR);
      });
  }
}