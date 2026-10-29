import { Injectable } from "@nestjs/common";
import { CreateLogsDto } from "./dto/create-log.dto";

@Injectable()
export class LogsService {
    createLogs(logData: CreateLogsDto) {
        return logData
    }
}