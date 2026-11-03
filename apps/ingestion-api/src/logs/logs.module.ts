import { Module } from '@nestjs/common';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logs } from './logs.entity';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';

@Module({
  imports: [TypeOrmModule.forFeature([Logs]), RabbitmqModule],
  controllers: [LogsController],
  providers: [LogsService,RabbitmqService],
  exports:[LogsService]
})
export class LogsModule {}
