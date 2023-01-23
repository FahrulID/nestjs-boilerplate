import { IsNotEmpty } from '@nestjs/class-validator';
import { CustomerDetails, ItemDetails } from '../../../utils/midtrans/types/midtrans.type';

export class MidtransChargeDto {

  @IsNotEmpty()
  ItemDetails: ItemDetails[];

  @IsNotEmpty()
  CustomerDetails: CustomerDetails;
}