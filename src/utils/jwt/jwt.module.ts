import { Module } from '@nestjs/common';
import * as NestJwt from '@nestjs/jwt';
import { JwtService } from './jwt.service';
import { SHA256Service } from '../hash/sha256.service';

@Module({
  imports: [NestJwt.JwtModule],
  providers: [JwtService, SHA256Service],
  exports: [JwtService],
})
export class JwtModule {}
