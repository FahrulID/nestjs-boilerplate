import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './resources/auth/auth.module';
import { PrismaModule } from './utils/prisma/prisma.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { PassportModule } from '@nestjs/passport';
import { MidtransModule } from './resources/midtrans/midtrans.module';

// Get environment variable of what environment we are running ( development, staging, production )
const ENV = process.env.ENV;

require('dotenv').config({ path: !ENV ? '.env' : `.env.${ENV}` });

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: !ENV ? '.env' : `.env.${ENV}`, // If ENV is not set, use .env file, else use .env.{ENV}
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_ID,
          pass: process.env.EMAIL_PASS
        },
      },
      defaults: {
        from: process.env.EMAIL_FROM, // outgoing email ID
      },
      template: {
        dir: process.cwd() + '/src/utils/mail/templates/',
        adapter: new HandlebarsAdapter(), // or new PugAdapter()
        options: {
          strict: true,
        },
      },
    }),
    PassportModule.register({}),
    PrismaModule,
    AuthModule,
    MidtransModule,
  ],
})
export class AppModule {}
