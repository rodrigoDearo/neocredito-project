import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/shared/filters/http-exception.filter';

describe('Neo Crédito API (E2E)', () => {
  let app: INestApplication;
  let tokenC1: string;
  let tokenOp: string;
  let pid: string;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, errorHttpStatusCode: 400 }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });
  afterAll(() => app.close());

  const post = (url: string, body: object, token?: string) =>
    request(app.getHttpServer()).post(url).set('Authorization', token ? `Bearer ${token}` : '').send(body);

  describe('Auth', () => {
    it('200 login corban1', async () => {
      const r = await post('/auth/login', { email: 'corban1@neocredito.com.br', senha: 'Teste@2024' });
      expect(r.status).toBe(200);
      tokenC1 = r.body.accessToken;
    });
    it('200 login operador', async () => {
      const r = await post('/auth/login', { email: 'operador@neocredito.com.br', senha: 'Teste@2024' });
      expect(r.status).toBe(200);
      tokenOp = r.body.accessToken;
    });
    it('401 senha errada', async () => {
      const r = await post('/auth/login', { email: 'corban1@neocredito.com.br', senha: 'errada' });
      expect(r.status).toBe(401);
    });
    it('401 sem token em rota protegida', async () => {
      expect((await request(app.getHttpServer()).get('/propostas')).status).toBe(401);
    });
  });

  describe('Propostas — criação', () => {
    it('201 cria com campos calculados e status RASCUNHO', async () => {
      const r = await post('/propostas', {
        clienteNome: 'E2E Test', clienteCpf: '529.982.247-25',
        clienteRenda: 5000, valorSolicitado: 8000, numeroParcelas: 12,
      }, tokenC1);
      expect(r.status).toBe(201);
      expect(r.body.status).toBe('RASCUNHO');
      expect(r.body.taxaJuros).toBeDefined();
      pid = r.body.id;
    });
    it('400 CPF formato inválido', async () => {
      const r = await post('/propostas', { clienteNome: 'X', clienteCpf: '123', clienteRenda: 1000, valorSolicitado: 1000, numeroParcelas: 6 }, tokenC1);
      expect(r.status).toBe(400);
    });
    it('400 valorSolicitado abaixo do mínimo', async () => {
      const r = await post('/propostas', { clienteNome: 'X', clienteCpf: '529.982.247-25', clienteRenda: 1000, valorSolicitado: 100, numeroParcelas: 6 }, tokenC1);
      expect(r.status).toBe(400);
    });
    it('400 numeroParcelas inválido', async () => {
      const r = await post('/propostas', { clienteNome: 'X', clienteCpf: '529.982.247-25', clienteRenda: 1000, valorSolicitado: 1000, numeroParcelas: 9 }, tokenC1);
      expect(r.status).toBe(400);
    });
  });

  describe('Propostas — status', () => {
    it('403 CORBAN não pode atualizar status', async () => {
      if (!pid) return;
      const r = await request(app.getHttpServer()).patch(`/propostas/${pid}/status`)
        .set('Authorization', `Bearer ${tokenC1}`).send({ status: 'EM_ANALISE' });
      expect(r.status).toBe(403);
    });
    it('200 OPERADOR avança RASCUNHO → EM_ANALISE', async () => {
      if (!pid) return;
      const r = await request(app.getHttpServer()).patch(`/propostas/${pid}/status`)
        .set('Authorization', `Bearer ${tokenOp}`).send({ status: 'EM_ANALISE' });
      expect(r.status).toBe(200);
      expect(r.body.status).toBe('EM_ANALISE');
    });
    it('422 transição inválida', async () => {
      if (!pid) return;
      const r = await request(app.getHttpServer()).patch(`/propostas/${pid}/status`)
        .set('Authorization', `Bearer ${tokenOp}`).send({ status: 'RASCUNHO' });
      expect(r.status).toBe(422);
    });
  });

  describe('Propostas — listagem', () => {
    it('200 com meta de paginação', async () => {
      const r = await request(app.getHttpServer()).get('/propostas').set('Authorization', `Bearer ${tokenC1}`);
      expect(r.status).toBe(200);
      expect(r.body).toHaveProperty('meta');
    });
    it('OPERADOR vê mais ou igual propostas que CORBAN', async () => {
      const [rc, ro] = await Promise.all([
        request(app.getHttpServer()).get('/propostas').set('Authorization', `Bearer ${tokenC1}`),
        request(app.getHttpServer()).get('/propostas').set('Authorization', `Bearer ${tokenOp}`),
      ]);
      expect(ro.body.meta.total).toBeGreaterThanOrEqual(rc.body.meta.total);
    });
  });
});
