import { Injectable } from '@nestjs/common';
import { argon2id, hash, verify } from 'argon2';

@Injectable()
export class Argon2Service {
  async hash(message: string): Promise<string> {
    const hashed = await hash(message, {
        type: argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
    });

    return hashed;
  }

  async compare(message: string, hash: string): Promise<boolean> {
    const isMatch = await verify(hash, message);

    return isMatch;
  }
}