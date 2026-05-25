import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Perfil } from '@prisma/client';
import { JwtPayload, ROLES_KEY } from '../../shared/decorators/auth.decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Perfil[]>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (!roles?.length) return true;
    const user: JwtPayload = ctx.switchToHttp().getRequest().user;
    if (!roles.includes(user.perfil))
      throw new ForbiddenException(`Perfil "${user.perfil}" sem permissão. Requerido: ${roles.join(' ou ')}.`);
    return true;
  }
}
