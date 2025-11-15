// Importa o módulo 'express' para criar o servidor web.
const express = require('express'); 

// Importa o módulo 'path' para trabalhar com caminhos de arquivos e diretórios, 
// garantindo compatibilidade entre diferentes sistemas operacionais.
const path = require('path');

// Importa o módulo 'node-fetch' para fazer requisições HTTP do lado do servidor (opcional, 
// dependendo da sua versão do Node, mas recomendado para consistência).
// Você precisará instalar ele: 'npm install node-fetch@2' se estiver usando CommonJS.
const fetch = require('node-fetch');

// Cria uma instância da aplicação Express.
const app = express();
// Define a porta onde o servidor irá escutar. O padrão 3000 é comum em desenvolvimento.
const PORT = 5000;

// Variáveis de Ambiente e Chaves de API
// ATENÇÃO: Nunca coloque chaves de API diretamente no código que vai para produção/repositório 
// sem usar um arquivo .env, mas para fins didáticos, a TMDB Key é definida aqui:
// Substitua 'SUA_CHAVE_TMDB_AQUI' pela sua chave real da API TMDB.
const TMDB_API_KEY = '33cc79e2003a68a2051851921ae14527'; 


// Middlewares e Configurações

// Configura o Express para servir arquivos estáticos (HTML, CSS, JavaScript client-side) 
// que estão localizados na pasta 'public'.
// Todos os arquivos dentro de 'public' serão acessíveis diretamente pela URL.
// Exemplo: 'http://localhost:3000/style.css'
app.use(express.static(path.join(__dirname, 'public')));


// *************************************************************************
// Rotas da API (API Endpoints Próprios)
// *************************************************************************
// Estas rotas servirão como um proxy entre o cliente (navegador) e as API's externas,
// protegendo a sua TMDB Key e centralizando a lógica de consumo.

// 1. Rota para buscar filmes populares na TMDB.
app.get('/api/tmdb/popular', async (req, res) => {
    // URL completa para buscar filmes populares.
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=pt-BR&page=1`;
    
    try {
        // Faz a requisição à API externa da TMDB.
        const response = await fetch(url);
        // Verifica se a resposta foi bem-sucedida.
        if (!response.ok) {
            // Se houver erro HTTP (ex: 404, 500), lança uma exceção.
            throw new Error(`Erro na requisição TMDB: ${response.statusText}`);
        }
        
        // Converte a resposta para JSON.
        const data = await response.json();
        // Retorna os dados para o cliente (navegador) no formato JSON.
        res.json(data.results); 
    } catch (error) {
        // Em caso de erro (ex: falha de rede ou HTTP), envia uma resposta de erro 500.
        console.error("Erro ao buscar filmes populares da TMDB:", error.message);
        res.status(500).json({ error: "Falha ao buscar dados da TMDB." });
    }
});

// Rota para buscar filmes na TMDB por termo.
app.get('/api/tmdb/search', async (req, res) => {
    // 1. Obtém o termo de busca (query) da URL que veio do frontend.
    const searchQuery = req.query.q; 
    
    // 2. Verifica se a query está presente (boas práticas REST).
    if (!searchQuery) {
        return res.status(400).json({ error: "Parâmetro de busca 'q' é obrigatório." });
    }

    // 3. Constrói a URL usando o endpoint de SEARCH da TMDB e a chave de API.
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}&language=pt-BR`;
    
    try {
        // 4. Faz a requisição à API externa da TMDB.
        const response = await fetch(url);
        
        // 5. Verifica se a TMDB retornou um erro (ex: 401 Unauthorized).
        if (!response.ok) {
            throw new Error(`Erro na requisição TMDB: ${response.statusText}`);
        }
        
        // 6. Processa a resposta.
        const data = await response.json();
        // Retorna apenas a lista de resultados (results)
        res.json(data.results); 
    } catch (error) {
        console.error("Erro ao buscar filmes na TMDB:", error.message);
        res.status(500).json({ error: "Falha ao buscar dados da TMDB." });
    }
});

// 2. Rota para buscar livros na Open Library por um termo de pesquisa (query).
app.get('/api/openlibrary/search', async (req, res) => {
    // Obtém o termo de pesquisa da URL (ex: ?q=Harry+Potter).
    const searchQuery = req.query.q;

    // Verifica se um termo de pesquisa foi fornecido.
    if (!searchQuery) {
        // Se a query 'q' estiver faltando, retorna um erro 400 (Bad Request).
        return res.status(400).json({ error: "Parâmetro de busca 'q' é obrigatório." });
    }

    // URL completa para buscar na Open Library (usando o termo de pesquisa).
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}`;
    
    try {
        // Faz a requisição à API externa da Open Library.
        const response = await fetch(url);
        
        // Verifica se a resposta foi bem-sucedida.
        if (!response.ok) {
            throw new Error(`Erro na requisição Open Library: ${response.statusText}`);
        }
        
        // Converte a resposta para JSON.
        const data = await response.json();
        // Retorna a lista de documentos (livros) para o cliente.
        res.json(data.docs); 
    } catch (error) {
        // Em caso de erro, envia uma resposta de erro 500.
        console.error("Erro ao buscar livros na Open Library:", error.message);
        res.status(500).json({ error: "Falha ao buscar dados da Open Library." });
    }
});

// *************************************************************************
// Rota Principal (Servindo o Arquivo HTML)
// *************************************************************************

// Rota para o caminho raiz ('/').
app.get('/', (req, res) => {
    // Envia o arquivo principal do projeto (que estará na pasta 'public').
    // O nome do seu arquivo principal no esquema que você enviou é 'api-demo.html' 
    // ou 'api-educacional.html'. Ajuste o nome conforme sua escolha.
    res.sendFile(path.join(__dirname, 'public', 'api-demo.html'));
});

// Array para armazenar FAVORITOS na memória do servidor
let favoritos = [];

// LISTAR FAVORITOS
app.get('/api/favoritos', (req, res) => {
    res.json(favoritos);
});

// ADICIONAR FAVORITO
app.post('/api/favoritos', express.json(), (req, res) => {
    const { filme } = req.body;

    if (!filme || !filme.id) {
        return res.status(400).json({ error: "É necessário enviar um objeto 'filme' com 'id'." });
    }

    // Verificar se já está nos favoritos
    if (favoritos.find(f => f.id === filme.id)) {
        return res.status(400).json({ error: "Este filme já está nos favoritos." });
    }

    favoritos.push(filme);

    res.json({ mensagem: "Filme adicionado aos favoritos!", favoritos });
});

// REMOVER FAVORITO
app.delete('/api/favoritos/:id', (req, res) => {
    const id = Number(req.params.id);

    favoritos = favoritos.filter(f => f.id !== id);

    res.json({ mensagem: "Filme removido com sucesso!", favoritos });
});

// *************************************************************************
// Início do Servidor
// *************************************************************************

// Inicia o servidor e o faz escutar na porta definida.
app.listen(PORT, () => {
    // Imprime uma mensagem no console para indicar que o servidor está funcionando e em qual porta.
    console.log(`Servidor rodando na porta ${PORT}. Acesse: http://localhost:${PORT}`);
});

// FIM DO ARQUIVO server.js
