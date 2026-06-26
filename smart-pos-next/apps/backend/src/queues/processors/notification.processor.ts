import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationJobData } from '../queues.service';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<NotificationJobData>) {
    const { userId, tenantId, type, titleAr, titleEn, bodyAr, bodyEn, actionUrl, entityType, entityId } = job.data;

    this.logger.log(`Processing notification job ${job.id} for user ${userId}`);

    try {
      const notification = await this.prisma.notification.create({
        data: {
          tenantId,
          userId,
          type,
          titleAr,
          titleEn,
          bodyAr,
          bodyEn,
          actionUrl: actionUrl || null,
          entityType: entityType || null,
          entityId: entityId || null,
        },
      });

      this.logger.log(`Notification created: ${notification.id} for user ${userId}`);

      return {
        notificationId: notification.id,
        userId,
        type,
        status: 'sent',
      };
    } catch (error) {
      this.logger.error(
        `Failed to create notification for user ${userId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}