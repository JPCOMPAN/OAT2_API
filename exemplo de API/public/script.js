// ======================================================================
// LOG
// ======================================================================
function logMessage(msg, json = null) {
  const logEl = document.getElementById("log");

  if (json) {
    logEl.textContent = msg + "\n" + JSON.stringify(json, null, 2);
  } else {
    logEl.textContent = msg;
  }
}

document.getElementById("btnClear").addEventListener("click", () => {
  document.getElementById("log").textContent = "Pronto.";
});

// ======================================================================
// TMDB - BUSCA FILMES
// ======================================================================
document.getElementById("tmdb-search-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const termo = document.getElementById("tmdb-search-input").value.trim();
  const div = document.getElementById("tmdb-results");

  div.innerHTML = "<p>Buscando...</p>";
  logMessage("Buscando filmes...");

  const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(termo)}`);
  const filmes = await res.json();

  logMessage("Filmes encontrados:", filmes);

  div.innerHTML = "";

  filmes.forEach(f => {
    const poster = f.poster_path
      ? `https://image.tmdb.org/t/p/w500${f.poster_path}`
      : "https://via.placeholder.com/300x450?text=Sem+Imagem";

    const card = document.createElement("div");
    card.className = "item-card";

    card.innerHTML = `
      <img class="card-image" src="${poster}">
      <div class="card-content">
        <h3>${f.title}</h3>
        <p>Ano: ${f.release_date ? f.release_date.substring(0, 4) : "N/A"}</p>
      </div>
      <button class="addFavBtn"
        data-id="${f.id}"
        data-title="${f.title}"
        data-poster="${poster}"
        style="background:#0d6efd;color:white;border:none;padding:10px;cursor:pointer;">
        ⭐ Favoritar
      </button>
    `;

    div.appendChild(card);
  });

  addFavoriteButtonEvents();
});

// ======================================================================
// BOTÃO FAVORITAR
// ======================================================================
function addFavoriteButtonEvents() {
  document.querySelectorAll(".addFavBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const filme = {
        id: Number(btn.dataset.id),
        title: btn.dataset.title,
        poster: btn.dataset.poster
      };

      logMessage("Enviando favorito...", filme);

      const res = await fetch("/api/favoritos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filme })
      });

      const txt = await res.text();
      logMessage(txt);
    });
  });
}

// ======================================================================
// OPENLIBRARY - LIVROS
// ======================================================================
document.getElementById("openlibrary-search-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const termo = document.getElementById("openlibrary-search-input").value.trim();
  const div = document.getElementById("openlibrary-results");

  div.innerHTML = "<p>Buscando...</p>";
  logMessage("Buscando livros...");

  const res = await fetch(`/api/openlibrary/search?q=${encodeURIComponent(termo)}`);
  const livros = await res.json();

  logMessage("Livros encontrados:", livros);

  div.innerHTML = "";

  livros.forEach(l => {
    const cover = l.cover_i
      ? `https://covers.openlibrary.org/b/id/${l.cover_i}-L.jpg`
      : "https://via.placeholder.com/300x450?text=Sem+Imagem";

    const card = document.createElement("div");
    card.className = "item-card";

    card.innerHTML = `
      <img class="card-image" src="${cover}">
      <div class="card-content">
        <h3>${l.title}</h3>
        <p>Autor: ${l.author_name ? l.author_name[0] : "Não informado"}</p>
      </div>
    `;

    div.appendChild(card);
  });
});

// ======================================================================
// FAVORITOS - LISTAR
// ======================================================================
document.getElementById("btnCarregarFavoritos").addEventListener("click", carregarFavoritos);

async function carregarFavoritos() {
  const div = document.getElementById("favoritos-list");
  div.innerHTML = "<p>Carregando...</p>";

  logMessage("Carregando favoritos...");

  const res = await fetch("/api/favoritos");
  const favoritos = await res.json();

  logMessage("Favoritos carregados:", favoritos);

  if (favoritos.length === 0) {
    div.innerHTML = "<p>Nenhum favorito salvo.</p>";
    return;
  }

  div.innerHTML = "";

  favoritos.forEach(filme => {
    const card = document.createElement("div");
    card.className = "item-card";

    card.innerHTML = `
      <img class="card-image" src="${filme.poster}">
      <div class="card-content">
        <h3>${filme.title}</h3>
      </div>

      <button class="removeFavBtn"
        data-id="${filme.id}"
        style="background:#dc3545;color:white;border:none;padding:10px;cursor:pointer;">
        ❌ Remover
      </button>
    `;

    div.appendChild(card);
  });

  addRemoveFavoriteEvents();
}

// ======================================================================
// REMOVER FAVORITO
// ======================================================================
function addRemoveFavoriteEvents() {
  document.querySelectorAll(".removeFavBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      logMessage(`Removendo favorito ID ${id}...`);

      await fetch(`/api/favoritos/${id}`, { method: "DELETE" });

      logMessage("Favorito removido com sucesso!");

      carregarFavoritos();
    });
  });
}
