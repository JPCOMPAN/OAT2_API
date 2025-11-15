# API Demo com Node + Express

Este exemplo demonstra um servidor simples em Node.js com Express que serve uma página HTML e implementa uma pequena API para operações CRUD em memória.

Arquivos criados:

- `server.js` - servidor Express com endpoints `/api/items` (GET/POST/PUT/DELETE) e que serve `api-demo-express.html` na raiz.
- `package.json` - dependências mínimas (`express`, `cors`, `body-parser`).
- `api-demo-express.html` - frontend em Bootstrap 5 que consome a API local.

Como executar:

1. Instale dependências (Node.js e npm devem estar instalados):

```powershell
cd "d:\Ramon\Unex\¬\Atividade de API\rest"
npm install
```

2. Inicie o servidor:

```powershell
npm start
# ou para desenvolvimento com nodemon
npm run dev
```

3. Abra o navegador em `http://localhost:3000`.

Notas para aula:

- A API é apenas em memória — reiniciar o servidor reseta os dados.
- Para demonstrar autenticação, adicione middleware que verifique cabeçalhos (por exemplo `Authorization`).
- Para persistência simples, substitua o array `items` por um arquivo JSON ou um banco de dados leve (SQLite, lowdb, etc.).

Possíveis melhorias (exercícios):

- Adicionar validação com `express-validator`.
- Adicionar paginação para `GET /api/items`.
- Implementar autenticação e autorização (JWT).

Licença: MIT
