import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from './mail.service';
import { MAIL_QUEUE, MAIL_JOBS } from './mail.constants';

interface SendMagicLinkJobData {
  email: string;
  magicLink: string;
  userName?: string;
}

interface SendInvitationJobData {
  email: string;
  inviterName: string;
  organizationName: string;
  invitationLink: string;
}

type MailJobData = SendMagicLinkJobData | SendInvitationJobData;

@Processor(MAIL_QUEUE)
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<MailJobData>): Promise<void> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case MAIL_JOBS.SEND_MAGIC_LINK:
        await this.handleSendMagicLink(job.data as SendMagicLinkJobData);
        break;
      case MAIL_JOBS.SEND_INVITATION:
        await this.handleSendInvitation(job.data as SendInvitationJobData);
        break;
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }

  private async handleSendMagicLink(data: SendMagicLinkJobData): Promise<void> {
    const { email, magicLink, userName } = data;

    const greeting = userName ? `Hello ${userName},` : 'Hello,';
    const text = `${greeting}\n\nClick the link below to sign in to your account:\n\n${magicLink}\n\nThis link will expire in 15 minutes.\n\nIf you didn't request this link, you can safely ignore this email.`;

    const success = await this.mailService.sendEmail({
      to: email,
      from: 'no-reply@humanline.com',
      subject: 'Sign in to HumanLine',
      text,
    });

    if (success) {
      this.logger.log(`Magic link email sent successfully to ${email}`);
    } else {
      this.logger.error(`Failed to send magic link email to ${email}`);
      throw new Error(`Failed to send email to ${email}`);
    }
  }

  private async handleSendInvitation(
    data: SendInvitationJobData,
  ): Promise<void> {
    const { email, inviterName, organizationName, invitationLink } = data;

    const text = `Hello,\n\n${inviterName} has invited you to join ${organizationName} on HumanLine.\n\nClick the link below to accept the invitation and create your account:\n\n${invitationLink}\n\nThis invitation will expire in 7 days.\n\nIf you weren't expecting this invitation, you can safely ignore this email.`;

    const success = await this.mailService.sendEmail({
      to: email,
      from: 'no-reply@humanline.com',
      subject: `You've been invited to join ${organizationName}`,
      text,
    });

    if (success) {
      this.logger.log(`Invitation email sent successfully to ${email}`);
    } else {
      this.logger.error(`Failed to send invitation email to ${email}`);
      throw new Error(`Failed to send email to ${email}`);
    }
  }
}
