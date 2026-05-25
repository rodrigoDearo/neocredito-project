import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Perfil } from '@prisma/client';
import { CurrentUser, JwtPayload, Roles } from '../../shared/decorators/auth.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreatePropostaDto } from './dto/create-proposta.dto';
import { ListPropostasDto } from './dto/list-propostas.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { PropostasService } from './propostas.service';

@ApiTags('Propostas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('propostas')
export class PropostasController {
  constructor(private service: PropostasService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Cria proposta (status RASCUNHO, campos calculados automaticamente)' })
  criar(@Body() dto: CreatePropostaDto, @CurrentUser() user: JwtPayload) {
    return this.service.criar(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Lista propostas — paginação + filtros status/clienteCpf' })
  listar(@Query() q: ListPropostasDto, @CurrentUser() user: JwtPayload) {
    return this.service.listar(q, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca por ID (CORBAN: apenas as próprias)' })
  buscarPorId(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.service.buscarPorId(id, user);
  }

  @Patch(':id/status')
  @Roles(Perfil.OPERADOR)
  @ApiOperation({ summary: 'Atualiza status — apenas OPERADOR' })
  atualizarStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStatusDto, @CurrentUser() user: JwtPayload) {
    return this.service.atualizarStatus(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete — status CANCELADA, não remove do banco' })
  cancelar(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.service.cancelar(id, user);
  }
}
