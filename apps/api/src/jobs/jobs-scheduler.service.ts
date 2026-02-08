import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class JobsSchedulerService {
  private readonly logger = new Logger(JobsSchedulerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Runs every day at midnight.
   * Closes any ACTIVE or DRAFT jobs whose expectedClosingDate has passed.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredJobs(): Promise<void> {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const result = await this.prisma.job.updateMany({
      where: {
        expectedClosingDate: { lt: now },
        status: { in: ['ACTIVE', 'DRAFT'] },
      },
      data: {
        status: 'CLOSED',
        updatedAt: new Date(),
      },
    });

    if (result.count > 0) {
      this.logger.log(`Auto-closed ${result.count} expired job(s)`);
    }
  }
}
