import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@repo/db';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    super({
      adapter,
      log: ['query', 'info', 'warn', 'error'],
    });
  }
}
