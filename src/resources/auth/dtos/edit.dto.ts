import { IsOptional, IsString, IsEmail } from '@nestjs/class-validator';

export class EditDto {

  @IsString()
  @IsOptional()
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsString()
  @IsOptional()
  first_name: string;

  @IsString()
  @IsOptional()
  last_name: string;
  
  @IsString()
  @IsOptional()
  address: string;
}