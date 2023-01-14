import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TryType, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TryService {
  constructor(
    private readonly prismaService: PrismaService
  ) {}

  async currentTries(ip: string, type: TryType)
  {
    const tries = await this.prismaService.tries.findUnique({
      where: {
        ip_type: {
          ip,
          type,
        }
      }
    });

    return tries;
  }

  async addTries(ip: string, type: TryType)
  {
    await this.prismaService.tries.upsert({
      where: {
        ip_type: {
          ip,
          type,
        }
      },
      update: {
        count: {
          increment: 1,
        },
      },
      create: {
        ip,
        type,
        count: 1,
      },
    });
  }

  async resetTries(ip: string, type: TryType)
  {
    const tries = await this.currentTries(ip, type);

    if(!tries)
      return;

    await this.prismaService.tries.delete({
      where: {
        ip_type: {
          ip,
          type,
        }
      }
    });
  }

  async checkTries(ip: string, type: TryType, max: number, maxTime: number): Promise<boolean>
  {
    try {
      const tries = await this.currentTries(ip, type);

      if(!tries)
        return true;

      if (tries.count % max === 0 && Date.now() < tries.last_try.getTime() + (maxTime * (tries.count / max)))
        throw new HttpException(`Max tries reached, try again in : ${maxTime * (tries.count / max) / 1000} seconds`, HttpStatus.TOO_MANY_REQUESTS); //`(${max} tries every ${maxTime / 1000} seconds)`
  
      return true;
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserFromEmail(email: string): Promise<User>
  {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          email,
        }
      });

      if(!user)
        throw new BadRequestException('User not found');
      
      return user;
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}