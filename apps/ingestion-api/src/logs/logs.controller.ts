import { Body, Controller, Get, Post } from "@nestjs/common";
import { CreateLogsDto } from "./dto/create-log.dto";
import { LogsService } from "./logs.service";

@Controller('logs')
export class LogsController {
    constructor(private readonly logsService: LogsService){}
    @Get()
    getLogs() {
        return "Getting Log";
    }

    @Post()
    createLog(@Body() logsDto: CreateLogsDto) {
        return this.logsService.createLogs(logsDto)
    }
}