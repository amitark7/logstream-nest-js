import { Type } from "class-transformer"
import { IsDate, IsEnum, IsJSON, IsObject, IsOptional, IsString, MaxLength } from "class-validator"

export enum TaskLevel {
    WARN = "WARN",
    INFO = "INFO",
    ERROR = "ERROR"
}

export class CreateLogsDto {
    @IsEnum(TaskLevel)
    level!: TaskLevel

    @IsString()
    @MaxLength(255)
    message!: string

    @IsString()
    @MaxLength(100)
    service!: string

    @IsObject()
    @IsOptional()
    metadata!: Record<string, unknown>;
}