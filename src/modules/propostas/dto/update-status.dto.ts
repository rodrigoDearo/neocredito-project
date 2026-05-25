import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({ enum: Status })
  @IsEnum(Status, { message: `status inválido. Valores: ${Object.values(Status).join(', ')}` })
  status: Status;

  @ApiProperty({ required: false, description: 'Obrigatório quando status = REPROVADA' })
  @ValidateIf(o => o.status === Status.REPROVADA)
  @IsString() @IsOptional()
  motivoReprovacao?: string;
}
