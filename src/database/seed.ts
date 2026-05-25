import { Perfil, PrismaClient, Status } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Teste@2024', 12);

  const c1 = await prisma.usuario.upsert({
    where: { email: 'corban1@neocredito.com.br' },
    update: {},
    create: { email: 'corban1@neocredito.com.br', senha: hash, perfil: Perfil.CORBAN, corbanId: null },
  });
  await prisma.usuario.update({ where: { id: c1.id }, data: { corbanId: c1.id } });

  const c2 = await prisma.usuario.upsert({
    where: { email: 'corban2@neocredito.com.br' },
    update: {},
    create: { email: 'corban2@neocredito.com.br', senha: hash, perfil: Perfil.CORBAN, corbanId: null },
  });
  await prisma.usuario.update({ where: { id: c2.id }, data: { corbanId: c2.id } });

  await prisma.usuario.upsert({
    where: { email: 'operador@neocredito.com.br' },
    update: {},
    create: { email: 'operador@neocredito.com.br', senha: hash, perfil: Perfil.OPERADOR, corbanId: null },
  });

  if ((await prisma.proposta.count()) === 0) {
    await prisma.proposta.createMany({
      data: [
        { clienteNome: 'Ana Ferreira',  clienteCpf: '123.456.789-09', clienteRenda: 4500,  valorSolicitado: 8000,  numeroParcelas: 12, taxaJuros: 1.89, valorParcela: 742.88,  totalAPagar: 8914.56,  status: Status.RASCUNHO,   corbanId: c1.id },
        { clienteNome: 'Bruno Rocha',   clienteCpf: '987.654.321-00', clienteRenda: 7000,  valorSolicitado: 20000, numeroParcelas: 24, taxaJuros: 2.19, valorParcela: 1108.78, totalAPagar: 26610.72, status: Status.EM_ANALISE, corbanId: c1.id },
        { clienteNome: 'Carla Mendes',  clienteCpf: '111.444.777-35', clienteRenda: 10000, valorSolicitado: 30000, numeroParcelas: 36, taxaJuros: 2.79, valorParcela: 1136.94, totalAPagar: 40929.84, status: Status.APROVADA,   corbanId: c1.id },
        { clienteNome: 'Diego Lima',    clienteCpf: '222.333.444-52', clienteRenda: 3000,  valorSolicitado: 3000,  numeroParcelas: 6,  taxaJuros: 1.99, valorParcela: 528.94,  totalAPagar: 3173.64,  status: Status.REPROVADA,  motivoReprovacao: 'Renda insuficiente.', corbanId: c2.id },
        { clienteNome: 'Elaine Costa',  clienteCpf: '555.666.777-08', clienteRenda: 5500,  valorSolicitado: 12000, numeroParcelas: 18, taxaJuros: 2.29, valorParcela: 823.58,  totalAPagar: 14824.44, status: Status.CANCELADA,  corbanId: c2.id },
      ],
    });
  }

  console.log('Concluido. Senha: Teste@2024');
}

main().catch(console.error).finally(() => prisma.$disconnect());
