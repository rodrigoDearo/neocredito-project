import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsPositive, IsString, Matches, Max, Min } from 'class-validator';
import { PARCELAS_VALIDAS } from '../../../shared/helpers/credit.calculator';

export class CreatePropostaDto {
  @ApiProperty() @IsString() @IsNotEmpty() clienteNome: string;

  @ApiProperty({ description: '000.000.000-00 ou 00000000000' })
  @IsString()
  @Matches(/^(\d{3}\.?\d{3}\.?\d{3}-?\d{2})$/, { message: 'CPF em formato inválido' })
  clienteCpf: string;

  @ApiProperty() @IsNumber() @IsPositive() clienteRenda: number;

  @ApiProperty({ description: 'Mín R$500 · Máx R$50.000' })
  @IsNumber() @Min(500) @Max(50000) valorSolicitado: number;

  @ApiProperty({ enum: [6, 12, 18, 24, 36] })
  @IsIn([...PARCELAS_VALIDAS], { message: `numeroParcelas deve ser: ${PARCELAS_VALIDAS.join(', ')}` })
  numeroParcelas: number;
}
