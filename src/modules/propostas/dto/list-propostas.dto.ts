import { ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListPropostasDto {
  @ApiPropertyOptional({ default: 1 })  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @ApiPropertyOptional({ default: 10 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number = 10;
  @ApiPropertyOptional({ enum: Status }) @IsOptional() @IsEnum(Status) status?: Status;
  @ApiPropertyOptional() @IsOptional() @IsString() clienteCpf?: string;
}
