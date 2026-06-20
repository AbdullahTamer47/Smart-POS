import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { NotificationProcessor } from './processors/notification.processor';
import { BackupProcessor } from './processors/backup.processor';
import { ReportProcessor } from './processors/report.processor';
import { EmailProcessor } from './processors/email.processor';
import { QueuesService } from './queues.service';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    BullModule.registerQueue(
      { name: 'notifications' },
      { name: 'backup' },
      { name: 'reports' },
      { name: 'email' },
      { name: 'sync' },
    ),
  ],
  providers: [
    NotificationProcessor,
    BackupProcessor,
    ReportProcessor,
    EmailProcessor,
    QueuesService,
  ],
  exports: [QueuesService],
})
export class QueuesModule {}