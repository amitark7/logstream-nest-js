import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LogsService } from './logs/logs.service';
import { LogsModule } from './logs/logs.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [LogsModule, RabbitmqModule],
  controllers: [AppController],
  providers: [AppService,LogsService],
})
export class AppModule {}
