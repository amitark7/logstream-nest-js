import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfirmChannel, ChannelModel, connect } from 'amqplib';
import { Logs } from '../logs/logs.entity';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqService.name);

  private connection: ChannelModel;
  private channel: ConfirmChannel;

  async onModuleInit() {
    const url =
      process.env.RABBITMQ_URL ??
      'amqp://logstream:logstream_dev_password@localhost:5672';
    try {
      this.connection = await connect(url);
      this.channel = await this.connection.createConfirmChannel();

      this.channel.on('return', (message) => {
        this.logger.error(
          `Message returned by RabbitMQ. Routing key: ${message.fields.routingKey}`,
        );
      });

      await this.channel.assertExchange('logs.exchange', 'direct', {
        durable: true,
      });

      await this.channel.assertQueue('logs.error.queue', { durable: true });
      await this.channel.assertQueue('logs.info.queue', { durable: true });
      await this.channel.assertQueue('logs.warn.queue', { durable: true });

      await this.channel.bindQueue(
        'logs.error.queue',
        'logs.exchange',
        'logs.error',
      );
      await this.channel.bindQueue(
        'logs.info.queue',
        'logs.exchange',
        'logs.info',
      );
      await this.channel.bindQueue(
        'logs.warn.queue',
        'logs.exchange',
        'logs.warn',
      );
      this.logger.log('Connected to RabbitMQ with ingestion API');
    } catch (error) {
      this.logger.error(
        'Failed to initialize RabbitMQ connection, confirm channel, or exchange',
        error instanceof Error ? error.stack : String(error),
      );
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error));
    }
  }

  async publishLog(logs: Logs) {
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not intialized..');
    }
    const eventId = crypto.randomUUID();
    let routingKey: string;
    switch (logs.level) {
      case 'ERROR':
        routingKey = 'logs.error';
        break;
      case 'INFO':
        routingKey = 'logs.info';
        break;
      case 'WARN':
        routingKey = 'logs.warn';
        break;
      default:
        throw new Error(`Unsupported log level: ${logs.level}`);
    }

    const message = Buffer.from(
      JSON.stringify({
        eventId,
        eventType: routingKey,
        version: 1,
        occurredAt: new Date().toISOString(),
        data: logs,
      }),
    );

    await new Promise<void>((resolve, reject) => {
      this.channel.publish(
        'logs.exchange',
        routingKey,
        message,
        {
          persistent: true,
          contentType: 'application/json',
          mandatory: true,
        },
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        },
      );
    });
    this.logger.log(`RabbitMQ confirmed logs ${logs.id}`);
  }

  onModuleDestroy(): void {
    this.connection.close();
    this.channel.close();
  }
}
