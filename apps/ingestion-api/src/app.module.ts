import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LogsService } from './logs/logs.service';
import { LogsModule } from './logs/logs.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME ?? 'logstream',
      password: process.env.DB_PASSWORD ?? 'logstream_dev_password',
      database: process.env.DB_DATABASE ?? 'logstream',
      autoLoadEntities: true,
      synchronize: true,
    }),
    LogsModule, RabbitmqModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
