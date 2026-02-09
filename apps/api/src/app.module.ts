import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { BranchesModule } from './branches/branches.module';
import { DepartmentsModule } from './departments/departments.module';
import { JobListingsModule } from './job-listings/job-listings.module';
import { CandidatesModule } from './candidates/candidates.module';
import { WorkflowStagesModule } from './workflow-stages/workflow-stages.module';
import { StageCandidatesModule } from './stage-candidates/stage-candidates.module';
import { BoardActivitiesModule } from './board-activities/board-activities.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { EmailTemplatesModule } from './email-templates/email-templates.module';
import { TagsModule } from './tags/tags.module';

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
    UsersModule,
    BranchesModule,
    DepartmentsModule,
    JobListingsModule,
    CandidatesModule,
    WorkflowStagesModule,
    StageCandidatesModule,
    BoardActivitiesModule,
    EvaluationsModule,
    EmailTemplatesModule,
    TagsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
