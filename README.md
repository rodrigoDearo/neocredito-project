# Neo Crédito API

API REST para Propostas de Crédito. Node.js 20 · TypeScript · NestJS 10 · PostgreSQL 16 · Prisma 5

## Pré-requisitos
- Node.js 20 LTS + npm 10
- Docker 24+ e docker-compose v2 (ou PostgreSQL 16 local)

## Instalação
```bash
git clone <repo> && cd neo-credito-api
npm install
cp .env.example .env   # edite DATABASE_URL e JWT_SECRET
```

## Rodando

### Com Docker (recomendado — sobe banco + API + migrations + seed)
```bash
docker-compose up
```

### Sem Docker
```bash
npx prisma migrate deploy   # ou migrate:dev para dev
npm run seed
npm run start:dev
```

API: `http://localhost:3000` · Swagger: `http://localhost:3000/docs`

## Testes
```bash
npm test           # unitários (credit.calculator.spec.ts)
npm run test:e2e   # integração (requer banco rodando)
npm run test:cov   # cobertura
```

## Credenciais (seed)
| Email                         | Senha      | Perfil   |
|-------------------------------|------------|----------|
| corban1@neocredito.com.br     | Teste@2024 | CORBAN   |
| corban2@neocredito.com.br     | Teste@2024 | CORBAN   |
| operador@neocredito.com.br    | Teste@2024 | OPERADOR |

## Endpoints
| Método | Rota                   | CORBAN                    | OPERADOR     |
|--------|------------------------|---------------------------|--------------|
| POST   | /auth/login            | —                         | —            |
| GET    | /auth/me               | ✅                        | ✅           |
| POST   | /propostas             | Apenas para seus clientes | Qualquer     |
| GET    | /propostas             | Apenas as próprias        | Todas        |
| GET    | /propostas/:id         | Apenas as próprias (403≠404) | Qualquer  |
| PATCH  | /propostas/:id/status  | ❌ 403                    | ✅ Todas     |
| DELETE | /propostas/:id         | Apenas RASCUNHO próprio   | Qualquer válido |

## Decisões técnicas

**NestJS**: Guards declarativos (`@Roles`), ValidationPipe global e DI nativa eliminam boilerplate de RBAC e validação. Alternativa Express exigiria implementar tudo manualmente.

**Prisma diretamente no Service**: Para o escopo do teste, o Repository Pattern adicionaria uma camada sem benefício real — Prisma já é uma abstração limpa. Documentado aqui como trade-off consciente; em produção com queries mais complexas, isolaria num Repository.

**PostgreSQL**: `DECIMAL(15,2)` nativo para valores financeiros evita erros de ponto flutuante. UUID nativo, ACID para consistência de status.

**JWT payload minimalista** (`sub`, `perfil`, `corbanId?`): evita lookup no banco a cada requisição. `corbanId` no payload é suficiente para o filtro de isolamento de CORBAN.

**403 vs 404 (AC4 US-02)**: CORBAN nunca recebe 404 ao acessar proposta de outro CORBAN — previne enumeração de IDs.

**Soft delete**: registro permanece com `status = CANCELADA` — rastreabilidade exigida em qualquer sistema financeiro.

## Com mais tempo
- Histórico de transições (`proposta_status_history`)
- Validação de `.env` com `@nestjs/config` + Joi na inicialização
- Rate limiting no `/auth/login` com `@nestjs/throttler`
- Blacklist de tokens via Redis
- `decimal.js` para cálculos financeiros de precisão
- Repository Pattern + testes unitários do Service com mock
