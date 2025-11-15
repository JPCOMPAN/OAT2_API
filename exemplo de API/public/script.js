      const logEl = document.getElementById('log');
      
      /**
       * Função de LOG que exibe mensagens e objetos JSON na área de log.
       */
      function log(msg, json) {
        const time = new Date().toLocaleTimeString();
        if (json) {
          logEl.textContent = `[${time}] ${msg}\n` + JSON.stringify(json, null, 2) + "\n\n" + logEl.textContent;
        } else {
          logEl.textContent = `[${time}] ${msg}\n\n` + logEl.textContent;
        }
      }

      /**
       * Função genérica para executar o fetch e registrar no log.
       */
      async function doFetchAndLog(url, method, containerId, displayFunction, query = null) {
          log(`Iniciando ${method} para: ${url}${query ? '?q=' + query : ''}`);
          const container = document.getElementById(containerId);
          container.innerHTML = `<p>Buscando por "${query || 'populares'}"...</p>`; // Feedback para o usuário

          try {
              let fetchUrl = url;
              if (query) {
                  // Assume que rotas de busca usam o parâmetro 'q'
                  fetchUrl += `?q=${encodeURIComponent(query)}`;
              }
              
              const response = await fetch(fetchUrl, { method: method });
              
              if (!response.ok) {
                  // Tenta obter o corpo do erro, caso seja JSON
                  const errorBody = await response.json().catch(() => response.statusText);
                  log(`ERRO: Status ${response.status} ${response.statusText} da API`, errorBody);
                  container.innerHTML = `<p style="color: red;">Erro ao carregar dados: ${response.status} ${response.statusText}</p>`;
                  return;
              }
              
              const data = await response.json();
              log(`Sucesso! Resposta da API (${containerId})`, data);

              // Chama a função específica para exibir os dados no DOM
              displayFunction(data, container, query);

          } catch (error) {
              log(`Erro de rede ou processamento: ${error.message}`);
              container.innerHTML = `<p style="color: red;">Erro na requisição: ${error.message}</p>`;
          }
      }

      // ----------------------------------------------------------------------
      // Funções Específicas de Exibição (Manipulação do DOM)
      // ----------------------------------------------------------------------

      function displayMovies(moviesData, container, query) {
          // A TMDB retorna um array de objetos (results) no nosso server.js
          const movies = Array.isArray(moviesData) ? moviesData : [];
          container.innerHTML = ''; 
          
          if (movies.length === 0) {
              container.innerHTML = `<p>Nenhum filme encontrado para "${query || 'a sua busca'}".</p>`;
              return;
          }
          
          const fragment = document.createDocumentFragment();
          movies.slice(0, 10).forEach(movie => { 
              const item = document.createElement('div');
              item.classList.add('item-card', 'movie-card'); 

              const imageUrl = movie.poster_path 
                  ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` 
                  : 'placeholder-movie.png';

              item.innerHTML = `
                  <img src="${imageUrl}" alt="${movie.title}" class="card-image">
                  <div class="card-content">
                      <h3>${movie.title}</h3>
                      <p>Data: ${movie.release_date}</p>
                      <p>Avaliação: ⭐️ ${movie.vote_average}</p>
                  </div>
              `;
              fragment.appendChild(item);
          });
          container.appendChild(fragment);
      }

      function displayBooks(booksData, container, query) {
          // A Open Library retorna um array de objetos (docs) no nosso server.js
          const books = Array.isArray(booksData) ? booksData : [];
          container.innerHTML = ''; 
          
          if (books.length === 0) {
              container.innerHTML = `<p>Nenhum livro encontrado para "${query || 'a sua busca'}".</p>`;
              return;
          }
          
          const fragment = document.createDocumentFragment();
          books.slice(0, 10).forEach(book => { 
              const item = document.createElement('div');
              item.classList.add('item-card', 'book-card'); 

              const coverID = book.cover_i;
              const coverUrl = coverID 
                  ? `https://covers.openlibrary.org/b/id/${coverID}-M.jpg` 
                  : 'placeholder-book.png';

              item.innerHTML = `
                  <img src="${coverUrl}" alt="${book.title || 'Livro sem Título'}" class="card-image">
                  <div class="card-content">
                      <h3>${book.title || 'Título Desconhecido'}</h3>
                      <p>Autor(es): ${book.author_name ? book.author_name.join(', ') : 'Desconhecido'}</p>
                      <p>Ano: ${book.first_publish_year || 'N/D'}</p>
                  </div>
              `;
              fragment.appendChild(item);
          });
          container.appendChild(fragment);
      }

      // ----------------------------------------------------------------------
      // Configuração de Eventos
      // ----------------------------------------------------------------------

      // Listener para o botão Limpar Log
      document.getElementById('btnClear').addEventListener('click', () => {
        logEl.textContent = 'Pronto.';
      });
      
      // Listener para o formulário de busca de FILMES (TMDB)
    document.getElementById('tmdb-search-form').addEventListener('submit', function(e) {
    e.preventDefault(); 
    const query = document.getElementById('tmdb-search-input').value;
    if (query) {
        // MUDE A ROTA AQUI: de /api/tmdb/popular para a nova rota de busca
        doFetchAndLog('/api/tmdb/search', 'GET', 'tmdb-results', displayMovies, query);
    }
});

      
      // Listener para o formulário de busca de LIVROS (Open Library)
      document.getElementById('openlibrary-search-form').addEventListener('submit', function(e) {
          e.preventDefault(); 
          const query = document.getElementById('openlibrary-search-input').value;
          if (query) {
              doFetchAndLog('/api/openlibrary/search', 'GET', 'openlibrary-results', displayBooks, query);
          }
      });
