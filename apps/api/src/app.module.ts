import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { JobsModule } from './jobs/jobs.module';
import { TagsModule } from './tags/tags.module';
import { BranchesModule } from './branches/branches.module';
import { HiringStagesModule } from './hiring-stages/hiring-stages.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
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
    TagsModule,
    BranchesModule,
    HiringStagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
