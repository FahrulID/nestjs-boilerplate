import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { AccessToken } from '../../utils/jwt/jwt.decorator';
import { AccessTokenGuard } from '../../utils/jwt/jwt.guard';
import { HttpResponderService } from '../../utils/responder/http-responder.service';
import { MidtransChargeDto } from './dtos/charge.dto';
import { MidtransStatusDto } from './dtos/status.dto';
import { MidtransService } from './midtrans.service';
import { PaymentType, TransactionDetails } from '../../utils/midtrans/types/midtrans.type';

@Controller('midtrans')
export class MidtransController {
  constructor(
    private readonly midtransService: MidtransService,
    private readonly response: HttpResponderService,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Post('/charge/:paymentType')
  async charge(@Param("paymentType") paymentType: PaymentType, @Body() ChargeRequest: MidtransChargeDto, @AccessToken("uid") uid: string)
  {
    try {
      paymentType = paymentType.toLowerCase() as PaymentType;
      const transactionDetails: TransactionDetails = await this.midtransService.createTransactionDetails(ChargeRequest.ItemDetails);
      const charge = await this.midtransService.charge(uid, paymentType, transactionDetails, ChargeRequest.ItemDetails, ChargeRequest.CustomerDetails);
      return await this.response.successWithData(charge, HttpStatus.OK, `Successfully charge with payment type of ${paymentType}`);
    }
    catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('/status')
  async status(@Body() StatusRequest: MidtransStatusDto)
  {
    try {
      const status = await this.midtransService.getStatus(StatusRequest.OrderId);
      return await this.response.successWithData(status, HttpStatus.OK, "Successfully get current user data");
    }
    catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('/webhook')
  async webhook()
  {
    try {

      // return await this.response.successWithData(user, HttpStatus.OK, "Successfully get current user data");
    }
    catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
