import { IsString, IsNotEmpty, IsEmail } from '@nestjs/class-validator';
import { Length } from 'class-validator';

export class ForgotPasswordDto {

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @Length(6, 6)
  token: string;
}