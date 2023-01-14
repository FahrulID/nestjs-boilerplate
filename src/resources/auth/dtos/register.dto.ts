import { IsString, IsNotEmpty, IsEmail } from '@nestjs/class-validator';

export class RegisterDto {

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;
  
  @IsString()
  @IsNotEmpty()
  address: string;
}