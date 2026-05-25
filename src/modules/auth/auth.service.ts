import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Perfil } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { JwtPayload } from '../../shared/decorators/auth.decorators';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async login({ email, senha }: LoginDto) {
    const u = await this.prisma.usuario.findUnique({ where: { email } });
    if (!u || !(await bcrypt.compare(senha, u.senha))) throw new UnauthorizedException('Credenciais inválidas');

    const payload: JwtPayload = {
      sub: u.id,
      perfil: u.perfil,
      ...(u.perfil === Perfil.CORBAN && u.corbanId ? { corbanId: u.corbanId } : {}),
    };
    return { accessToken: this.jwt.sign(payload) };
  }

  async me(userId: string) {
    const u = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { id: true, email: true, perfil: true, corbanId: true, criadoEm: true },
    });
    if (!u) throw new NotFoundException('Usuario não encontrado');
    return u;
  }
}
