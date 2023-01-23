import { IsNotEmpty, IsString } from '@nestjs/class-validator';

export class MidtransStatusDto {

  @IsString()
  @IsNotEmpty()
  OrderId: string;
}