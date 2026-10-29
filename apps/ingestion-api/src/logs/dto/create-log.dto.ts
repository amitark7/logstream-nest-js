import { Type } from "class-transformer"
import { IsDate, IsEnum, IsJSON, IsObject, IsOptional, IsString } from "class-validator"

export enum TaskLevel {
    LOG = "LOG",
    INFO = "INFO",
    ERROR = "ERROR"
}

export class CreateLogsDto {
    @IsEnum(TaskLevel)
    level!: TaskLevel

    @IsString()
    message!: string

    @IsString()
    service!: string

    @IsDate()  
    @Type(() => Date)
    timestamp!: Date

    @IsObject()
    @IsOptional()
    metadata!: Record<string, unknown>;
}