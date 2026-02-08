import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';

import { AppService } from './app.service';
import { JobsModule } from './jobs/jobs.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { OrganizationsModule } from './organizations/organizations.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL,
      },
    }),
    DatabaseModule,
    AuthModule,
    MailModule,
    OrganizationsModule,
    JobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
