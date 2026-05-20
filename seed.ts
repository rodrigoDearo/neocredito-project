import { PrismaClient, Perfil, Status } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;
const SENHA_PADRAO = 'estou@testando';

async function main() {
  console.log('Vou popular o banco..');

  const senhaHash = await bcrypt.hash(SENHA_PADRAO, SALT_ROUNDS);

// USUARIO 1 DADOS E INSERÇÃO
  const corban1 = await prisma.usuario.upsert({
    where: { 
      email: 'corban1@gmail.com' 
    },
    update: {},
    create: {
      email: 'corban1@gmail.com',
      senha: senhaHash,
      perfil: Perfil.CORBAN,
      corbanId: null,
    },
  });

  await prisma.usuario.update({
    where: { id: corban1.id },
    data: { corbanId: corban1.id },
  });

// USUARIO 2 DADOS E INSERÇÃO
  const corban2 = await prisma.usuario.upsert({
    where: { email: 'corban2@gmail.com' },
    update: {},
    create: {
      email: 'corban2@gmail.com',
      senha: senhaHash,
      perfil: Perfil.CORBAN,
      corbanId: null,
    },
  });

  await prisma.usuario.update({
    where: { id: corban2.id },
    data: { corbanId: corban2.id },
  });

// USUARIO 3 DADOS E INSERÇÃO
  const operador = await prisma.usuario.upsert({
    where: { email: 'operador@gmail.com' },
    update: {},
    create: {
      email: 'operador@gmail.com',
      senha: senhaHash,
      perfil: Perfil.OPERADOR,
      corbanId: null,
    },
  });


// PROPOSTAS

  const propostasExistentes = await prisma.proposta.count();
  if (propostasExistentes === 0) {
    await prisma.proposta.createMany({
      data: [
        {
          clienteNome: 'Ana Paula Ferreira',
          clienteCpf: '123.456.789-09',
          clienteRenda: 4500.0,
          valorSolicitado: 8000.0,
          numeroParcelas: 12,
          taxaJuros: 1.89,
          valorParcela: 742.88,
          totalAPagar: 8914.56,
          status: Status.RASCUNHO,
          corbanId: corban1.id,
        },
        {
          clienteNome: 'Bruno Carvalho',
          clienteCpf: '987.654.321-00',
          clienteRenda: 7000.0,
          valorSolicitado: 20000.0,
          numeroParcelas: 24,
          taxaJuros: 2.19,
          valorParcela: 1108.78,
          totalAPagar: 26610.72,
          status: Status.EM_ANALISE,
          corbanId: corban1.id,
        },
        {
          clienteNome: 'Carla Mendes',
          clienteCpf: '111.444.777-35',
          clienteRenda: 10000.0,
          valorSolicitado: 30000.0,
          numeroParcelas: 36,
          taxaJuros: 2.79,
          valorParcela: 1136.94,
          totalAPagar: 40929.84,
          status: Status.APROVADA,
          corbanId: corban1.id,
        },
        {
          clienteNome: 'Diego Rocha',
          clienteCpf: '222.333.444-52',
          clienteRenda: 3000.0,
          valorSolicitado: 3000.0,
          numeroParcelas: 6,
          taxaJuros: 1.99,
          valorParcela: 528.94,
          totalAPagar: 3173.64,
          status: Status.REPROVADA,
          motivoReprovacao: 'Renda insuficiente para o valor solicitado.',
          corbanId: corban2.id,
        },
        {
          clienteNome: 'Elaine Costa',
          clienteCpf: '555.666.777-08',
          clienteRenda: 5500.0,
          valorSolicitado: 12000.0,
          numeroParcelas: 18,
          taxaJuros: 2.29,
          valorParcela: 823.58,
          totalAPagar: 14824.44,
          status: Status.CANCELADA,
          corbanId: corban2.id,
        },
      ],
    });

    console.log('Propostas criadas');
  } else {
    console.log('Propostas ja existem');
  }


}

main()
.catch((erro) => {
  console.error('Deu erro ao tentar povoar o banco:', erro);
  process.exit(1);
})
.finally(() => 
  prisma.$disconnect()
);
