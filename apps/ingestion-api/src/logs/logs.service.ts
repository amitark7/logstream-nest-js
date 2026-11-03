import { Injectable } from '@nestjs/common';
import { CreateLogsDto } from './dto/create-log.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Logs } from './logs.entity';
import { Repository } from 'typeorm';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Logs) private readonly logsRepository: Repository<Logs>,
    private readonly rabbitmq: RabbitmqService,
  ) {}
  async createLogs(logData: CreateLogsDto) {
    const log = this.logsRepository.create(logData);
    let savedLogs;
    try {
      savedLogs = await this.logsRepository.save(log);
      await this.rabbitmq.publishLog(savedLogs);
    } catch (err) {
      console.error('Failed to publish log', err);
    }

    return savedLogs;
  }
}
