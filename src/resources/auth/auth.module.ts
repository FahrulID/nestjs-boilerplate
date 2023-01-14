import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Argon2Service } from '../../utils/hash/argon2.service';
import { HttpResponderService } from '../../utils/responder/http-responder.service';
import { PrismaModule } from '../../utils/prisma/prisma.module';
import { JwtModule } from '../../utils/jwt/jwt.module';
import { MailService } from '../../utils/mail/mail.service';
import { SHA256Service } from '../../utils/hash/sha256.service';
import { TryService } from '../../utils/try/try.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, Argon2Service, HttpResponderService, MailService, SHA256Service, TryService],
  imports: [PrismaModule, JwtModule],
})
export class AuthModule {}
