const express = require('express'); // Basicamente importa o framework Express para criar o server web

const path = require('path'); // Módulo para mexer nos caminhos de arquivos alémn de garantir compatibilidade entre os sistemas operacionais

// Importa o módulo 'node-fetch' para fazer requisições HTTP do lado do servidor (opcional, 
// dependendo da sua versão do Node, mas recomendado para consistência).
const fetch = require('node-fetch'); // Importa o módulo node-fetch para fazer requisições HTTP do lado do servidor

const app = express();
// Define a porta onde o servidor irá escutar o de sempre da maioria dos servidores.
const PORT = 5000;

// Variáveis de Ambiente e Chaves de API aviso importante,jamais deve ser colocado a chave da API no codigo basicamente se usa o .env para que não exista essa exposição da chave no codigo que vai ser upado.
const TMDB_API_KEY = '33cc79e2003a68a2051851921ae14527';

// A linha configura o Express para servir arquivos estáticos tipo HTML, CSS e js) que estão na pasta public, dessa forma deixa esses arquivos acessíveis diretamente pela url.
app.use(express.static(path.join(__dirname, 'public')));

//  Basicamente esas rotas servirão como um proxy entre o cliente (navegador) e as API's externas,
// e essas otas que funcionam como proxy para APIs externas, protegendo a TMDB key devido a fazer um intermedio das informações.
app.get('/api/tmdb/popular', async (req, res) => { // Rota para buscar filmes populares na tmdb como é claramente visivel no caminho da rota.
    // url totalmente montada para buscar filmes populares.
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=pt-BR&page=1`;
    try {
        // Faz a requisição à API externa da TMDB
        const response = await fetch(url);
        // Verifica se houve sucesso na requisição
        if (!response.ok) {
            // Se houver erro HTTP na requisição retorna uma mensagem de erro.
            throw new Error(`Erro na requisição TMDB: ${response.statusText}`);
        }
        // Converte a resposta para JSON.
        const data = await response.json();
        // Retorna os dados para o cliente em formato json
        res.json(data.results);
    } catch (error) {
        // Em caso de erro retorna 500 nesse caso retorna uma mensagem de erro
        console.error("Erro ao buscar filmes populares da TMDB:", error.message);
        res.status(500).json({ error: "Falha ao buscar dados da TMDB." });
    }
});

// Rota para buscar filmes na TMDB por termo.
app.get('/api/tmdb/search', async (req, res) => {
    // Obtém o termo de busca query (como é visto abaixo)da URL que veio la do frontend.
    const searchQuery = req.query.q;
    //Verifica se a mesma está presente.
    if (!searchQuery) {
        return res.status(400).json({ error: "Parâmetro de busca 'q' é obrigatório." });
    }
    // 3. Constrói a URL usando o endpoint de search da TMDB e a chave de API.
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}&language=pt-BR`;
    try {
        // 4. Faz a requisição à API externa da TMDB.
        const response = await fetch(url);
        // 5. Verifica se a TMDB retornou um erro.
        if (!response.ok) {
            throw new Error(`Erro na requisição TMDB: ${response.statusText}`);
        }
        // 6. Processa a resposta.
        const data = await response.json();
        // Retorna apenas a lista de resultados nesse caso results como visto abaixo.
        res.json(data.results);
    } catch (error) {
        console.error("Erro ao buscar filmes na TMDB:", error.message);
        res.status(500).json({ error: "Falha ao buscar dados da TMDB." });
    }
});

// 2. Rota para buscar livros na Open Library por um termo de pesquisa
app.get('/api/openlibrary/search', async (req, res) => {
    // Obtém o termo de pesquisa da URL
    const searchQuery = req.query.q;
    // Verifica se um termo de pesquisa foi fornecido.
    if (!searchQuery) {
        // Se a query q estiver faltando, retorna um erro 400.
        return res.status(400).json({ error: "Parâmetro de busca 'q' é obrigatório." });
    }
    // URL completa para buscar na Open Library usando o termo de pesquisa.
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}`;
    try {
        // Faz a requisição à API externa da Open Library nesse caso
        const response = await fetch(url);
        // Verifica se a resposta foi bem-sucedida.
        if (!response.ok) {
            throw new Error(`Erro na requisição Open Library: ${response.statusText}`);
        }
        // Converte a resposta para JSON.
        const data = await response.json();
        // Retorna a lista de documentos livros nesse caso para o cliente.
        res.json(data.docs);
    } catch (error) {
        // Em caso de erro, envia uma resposta de erro 500.
        console.error("Erro ao buscar livros na Open Library:", error.message);
        res.status(500).json({ error: "Falha ao buscar dados da Open Library." });
    }
});

// Rota para o caminho raiz / como é visto abaixo.
app.get('/', (req, res) => {
    // Envia o arquivo principal do projeto que estará na pasta public
    res.sendFile(path.join(__dirname, 'public', 'api-demo.html'));
});

let favoritos = [];

app.get('/api/favoritos', (req, res) => {
    res.json(favoritos);
});

app.post('/api/favoritos', express.json(), (req, res) => {
    const payload = req.body;
    let item = null;
    if (payload.filme) item = payload.filme;
    if (payload.livro) item = payload.livro;
    if (!item || !item.id) {
        return res.status(400).json({ error: "É necessário enviar um objeto 'filme' ou 'livro' com 'id'." });
    }
    const normalized = { id: String(item.id), title: item.title || item.name || "", poster: item.poster || item.cover || "" };
    if (favoritos.find(f => String(f.id) === normalized.id)) {
        return res.status(400).json({ error: "Este item já está nos favoritos." });
    }
    favoritos.push(normalized);
    res.json({ mensagem: "Item adicionado aos favoritos!", favoritos });
});

app.delete('/api/favoritos/:id', (req, res) => {
    const id = String(req.params.id);
    favoritos = favoritos.filter(f => String(f.id) !== id);
    res.json({ mensagem: "Item removido com sucesso!", favoritos });
});

// Inicia o servidor e o faz escutar na porta
app.listen(PORT, () => {
    // Mostra uma mensagem no console indicando que o servidor está rodando.
    console.log(`Servidor rodando na porta ${PORT}. Acesse: http://localhost:${PORT}`);
});
