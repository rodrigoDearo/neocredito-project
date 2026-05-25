import { ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Perfil, Prisma, Status } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { JwtPayload } from '../../shared/decorators/auth.decorators';
import { calcularCredito, ParcelasValidas } from '../../shared/helpers/credit.calculator';
import { isCpfValido, isCpfFormatoValido, normalizarCpf } from '../../shared/helpers/cpf.helper';
import { erroTransicao, isTransicaoValida } from '../../shared/helpers/status-transitions';
import { CreatePropostaDto } from './dto/create-proposta.dto';
import { ListPropostasDto } from './dto/list-propostas.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class PropostasService {
  constructor(private prisma: PrismaService) {}

  async criar(dto: CreatePropostaDto, user: JwtPayload) {
    if (!isCpfFormatoValido(dto.clienteCpf) || !isCpfValido(dto.clienteCpf))
      throw new UnprocessableEntityException('CPF inválido');

    const { taxaJuros, valorParcela, totalAPagar } = calcularCredito(
      dto.valorSolicitado,
      dto.numeroParcelas as ParcelasValidas,
    );

    const corbanId = user.perfil === Perfil.CORBAN ? user.corbanId! : user.sub;

    return this.prisma.proposta.create({
      data: {
        clienteNome: dto.clienteNome,
        clienteCpf: normalizarCpf(dto.clienteCpf),
        clienteRenda: dto.clienteRenda,
        valorSolicitado: dto.valorSolicitado,
        numeroParcelas: dto.numeroParcelas,
        taxaJuros, valorParcela, totalAPagar,
        status: Status.RASCUNHO,
        corban: { connect: { id: corbanId } },
      },
    });
  }

  async listar(q: ListPropostasDto, user: JwtPayload) {
    const where: Prisma.PropostaWhereInput = {
      ...(q.status && { status: q.status }),
      ...(q.clienteCpf && { clienteCpf: { contains: q.clienteCpf.replace(/[.\-]/g, ''), mode: 'insensitive' } }),
      ...(user.perfil === Perfil.CORBAN && { corbanId: user.corbanId }),
    };
    const skip = ((q.page ?? 1) - 1) * (q.limit ?? 10);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.proposta.findMany({ where, skip, take: q.limit ?? 10, orderBy: { criadoEm: 'desc' } }),
      this.prisma.proposta.count({ where }),
    ]);
    return { data, meta: { total, page: q.page ?? 1, limit: q.limit ?? 10, totalPages: Math.ceil(total / (q.limit ?? 10)) } };
  }

  async buscarPorId(id: string, user: JwtPayload) {
    const p = await this.prisma.proposta.findUnique({ where: { id } });
    if (!p) {
      if (user.perfil === Perfil.OPERADOR) throw new NotFoundException('Proposta não encontrada');
      throw new ForbiddenException('Acesso negado'); // AC4: CORBAN nunca recebe 404
    }
    if (user.perfil === Perfil.CORBAN && p.corbanId !== user.corbanId)
      throw new ForbiddenException('Acesso negado');
    return p;
  }

  async atualizarStatus(id: string, dto: UpdateStatusDto, user: JwtPayload) {
    const p = await this.prisma.proposta.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Proposta não encontrada');
    if (!isTransicaoValida(p.status, dto.status))
      throw new UnprocessableEntityException(erroTransicao(p.status, dto.status));
    if (dto.status === Status.REPROVADA && !dto.motivoReprovacao?.trim())
      throw new UnprocessableEntityException('motivoReprovacao é obrigatório quando status = REPROVADA');
    return this.prisma.proposta.update({ where: { id }, data: { status: dto.status, motivoReprovacao: dto.motivoReprovacao } });
  }

  async cancelar(id: string, user: JwtPayload) {
    const p = await this.prisma.proposta.findUnique({ where: { id } });
    if (!p) {
      if (user.perfil === Perfil.OPERADOR) throw new NotFoundException('Proposta não encontrada');
      throw new ForbiddenException('Acesso negado');
    }
    if (user.perfil === Perfil.CORBAN) {
      if (p.corbanId !== user.corbanId) throw new ForbiddenException('Acesso negado');
      if (p.status !== Status.RASCUNHO) throw new UnprocessableEntityException('CORBAN só pode cancelar propostas em RASCUNHO');
    }
    if (!isTransicaoValida(p.status, Status.CANCELADA))
      throw new UnprocessableEntityException(erroTransicao(p.status, Status.CANCELADA));
    return this.prisma.proposta.update({ where: { id }, data: { status: Status.CANCELADA } });
  }
}
