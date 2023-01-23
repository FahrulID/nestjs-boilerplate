import { Module } from '@nestjs/common';
import { MidtransService } from './midtrans.service';
import { MidtransController } from './midtrans.controller';
import { PrismaModule } from '../../utils/prisma/prisma.module';
import { JwtModule } from '../../utils/jwt/jwt.module';
import { HttpResponderService } from '../../utils/responder/http-responder.service';
import { MidtransAPIService } from '../../utils/midtrans/midtrans.service';

@Module({
  controllers: [MidtransController],
  providers: [MidtransService, HttpResponderService, MidtransAPIService],
  imports: [PrismaModule, JwtModule],
})
export class MidtransModule {}
