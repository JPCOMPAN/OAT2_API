# API Demo - Aula

Este repositório contém um exemplo simples em HTML (Bootstrap 5) para demonstrar chamadas a APIs usando `fetch` no navegador.

Arquivos:

- `api-demo.html` - Página HTML pronta para demonstração. Possui exemplos de GET, POST, PUT e DELETE usando `fetch` e exibe logs/respostas.

Como usar:

1. Abra `api-demo.html` diretamente no navegador (arquivo local). Observação: alguns navegadores bloqueiam CORS/`fetch` ao abrir arquivos locais; se encontrar problemas, execute um servidor estático.

2. Para executar um servidor local simples (recomendado), use Python (se instalado):

```powershell
# No Windows PowerShell, execute na pasta do projeto
cd "d:\Ramon\Unex\¬\Atividade de API\rest"
# Python 3
python -m http.server 8000
# então abra http://localhost:8000/api-demo.html
```

3. Alternativas (Node.js):

```powershell
# instalar http-server globalmente (se necessário)
npm install -g http-server
http-server -p 8000
# então abra http://localhost:8000/api-demo.html
```

Observações para aula:

- O HTML usa `https://jsonplaceholder.typicode.com` por padrão — um serviço público para testes. Para usar sua API, altere as URLs nos campos do formulário.
- Exemplos cobertos: GET (obter recurso), POST (criar), PUT (atualizar) e DELETE (remover).
- O painel de logs mostra status HTTP e a resposta (formatada se for JSON).

Sugestões de exercícios:

1. Alterar a URL para um endpoint próprio e testar autenticação (adicionar cabeçalhos `Authorization`).
2. Tratar erros detalhadamente (ex.: mostrar códigos de erro e mensagens amigáveis no UI).
3. Salvar comandos recentes no localStorage para reaproveitamento.

Licença: MIT
