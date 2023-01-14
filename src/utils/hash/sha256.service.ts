import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class SHA256Service {
  hash(message: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(message);
    return hash.digest('hex');
  }

  compare(message: string, hash: string): boolean {
    return this.hash(message) === hash;
  }
}