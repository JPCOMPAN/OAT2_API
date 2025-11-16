const express = require('express'); 
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = 5000;

const TMDB_API_KEY = '33cc79e2003a68a2051851921ae14527';

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/tmdb/popular', async (req, res) => {
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=pt-BR&page=1`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro na requisição TMDB: ${response.statusText}`);
        }
        const data = await response.json();
        res.json(data.results);
    } catch (error) {
        console.error("Erro ao buscar filmes populares da TMDB:", error.message);
        res.status(500).json({ error: "Falha ao buscar dados da TMDB." });
    }
});

app.get('/api/tmdb/search', async (req, res) => {
    const searchQuery = req.query.q;
    if (!searchQuery) {
        return res.status(400).json({ error: "Parâmetro de busca 'q' é obrigatório." });
    }
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}&language=pt-BR`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro na requisição TMDB: ${response.statusText}`);
        }
        const data = await response.json();
        res.json(data.results);
    } catch (error) {
        console.error("Erro ao buscar filmes na TMDB:", error.message);
        res.status(500).json({ error: "Falha ao buscar dados da TMDB." });
    }
});

app.get('/api/openlibrary/search', async (req, res) => {
    const searchQuery = req.query.q;
    if (!searchQuery) {
        return res.status(400).json({ error: "Parâmetro de busca 'q' é obrigatório." });
    }
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro na requisição Open Library: ${response.statusText}`);
        }
        const data = await response.json();
        res.json(data.docs);
    } catch (error) {
        console.error("Erro ao buscar livros na Open Library:", error.message);
        res.status(500).json({ error: "Falha ao buscar dados da Open Library." });
    }
});

app.get('/', (req, res) => {
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

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}. Acesse: http://localhost:${PORT}`);
});
