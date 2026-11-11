# Testes E2E (IC-TST-01)

Os testes ponta a ponta usam a coleção `docs/api/postman_collection.json` rodando no **Newman**.
Ela executa o fluxo completo de um chamado com os três perfis (usuário, técnico e gestor) e confere status, regras e permissões.

```bash
npx prisma migrate deploy && npm run db:seed   # banco com as tabelas + usuários de demonstração
npm run build && npm start                       # API em http://localhost:3000
npm run test:e2e                                 # em outro terminal
```

Na CI (`.github/workflows/ci.yml`) esse passo roda automaticamente.
