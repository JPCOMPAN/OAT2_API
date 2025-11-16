function logMessage(msg, json = null) {
  const log = document.getElementById("log")
  const t = new Date().toLocaleTimeString()
  log.textContent =
    `[${t}] ${msg}\n` +
    (json ? JSON.stringify(json, null, 2) + "\n\n" : "") +
    log.textContent
}

document.getElementById("btnClear").onclick = () => {
  document.getElementById("log").textContent = "Pronto."
}

function createCard({ img, title, meta, actions = [] }) {
  const c = document.createElement("div")
  c.className = "item"
  c.innerHTML = `
    <img class="thumb" loading="lazy" src="${img}">
    <div class="content">
      <h4 class="title">${title}</h4>
      <p class="meta">${meta || ""}</p>
      <div class="actions"></div>
    </div>
  `
  const a = c.querySelector(".actions")
  actions.forEach(x => {
    const b = document.createElement("button")
    b.className = "chip"
    if (x.type === "fav") b.classList.add("fav")
    if (x.type === "remove") b.classList.add("remove")
    b.textContent = x.label
    if (x.attrs) Object.keys(x.attrs).forEach(k => b.setAttribute(k, x.attrs[k]))
    b.onclick = x.onClick
    a.appendChild(b)
  })
  const thumb = c.querySelector(".thumb")
  thumb.onerror = () => { thumb.src = "https://via.placeholder.com/400x600?text=Sem+Imagem" }
  return c
}

async function fetchJson(url) {
  try {
    const r = await fetch(url)
    if (!r.ok) throw new Error(await r.text())
    return await r.json()
  } catch (e) {
    logMessage("Erro: " + e.message)
    return null
  }
}

async function getFavoritos() {
  return (await fetchJson("/api/favoritos")) || []
}

function isFavorito(id, favs) {
  return favs.some(f => String(f.id) === String(id))
}


function renderPagination(containerId, currentPage, totalPages, onPageClick) {
  const container = document.getElementById(containerId)
  container.innerHTML = ""

  if (totalPages <= 1) return

  const makeBtn = (label, page, disabled = false, active = false) => {
    const b = document.createElement("button")
    b.textContent = label
    if (active) b.classList.add("active")
    if (disabled) b.disabled = true
    b.onclick = () => {
      if (!disabled) onPageClick(page)
    }
    container.appendChild(b)
  }

  makeBtn("<<", 1, currentPage === 1)
  makeBtn("<", currentPage - 1, currentPage === 1)

  // If many pages, show a window around current page for readability
  const maxButtons = 7
  if (totalPages <= maxButtons) {
    for (let i = 1; i <= totalPages; i++) makeBtn(i, i, false, i === currentPage)
  } else {
    let start = Math.max(1, currentPage - 3)
    let end = Math.min(totalPages, currentPage + 3)
    if (currentPage <= 4) {
      start = 1
      end = Math.min(totalPages, maxButtons)
    } else if (currentPage >= totalPages - 3) {
      end = totalPages
      start = Math.max(1, totalPages - (maxButtons - 1))
    }
    if (start > 1) {
      makeBtn(1, 1, false, 1 === currentPage)
      if (start > 2) {
        const ell = document.createElement("span")
        ell.textContent = "…"
        ell.style.padding = "10px"
        container.appendChild(ell)
      }
    }
    for (let i = start; i <= end; i++) makeBtn(i, i, false, i === currentPage)
    if (end < totalPages) {
      if (end < totalPages - 1) {
        const ell = document.createElement("span")
        ell.textContent = "…"
        ell.style.padding = "10px"
        container.appendChild(ell)
      }
      makeBtn(totalPages, totalPages, false, totalPages === currentPage)
    }
  }

  makeBtn(">", currentPage + 1, currentPage === totalPages)
  makeBtn(">>", totalPages, currentPage === totalPages)
}


let filmesPaginaAtual = 1
let filmesPorPagina = 6
let filmesCache = []

async function renderFilmes(lista) {
  filmesCache = lista || []
  const favs = await getFavoritos()

  const totalPages = Math.max(1, Math.ceil(lista.length / filmesPorPagina))
  if (filmesPaginaAtual > totalPages) filmesPaginaAtual = totalPages
  const start = (filmesPaginaAtual - 1) * filmesPorPagina
  const itensPag = lista.slice(start, start + filmesPorPagina)

  const div = document.getElementById("tmdb-results")
  div.innerHTML = ""

  itensPag.forEach(f => {
    const poster = f.poster_path
      ? `https://image.tmdb.org/t/p/w500${f.poster_path}`
      : "https://via.placeholder.com/400x600?text=Sem+Imagem"

    const favorito = isFavorito(f.id, favs)

    const card = createCard({
      img: poster,
      title: f.title,
      meta: f.release_date ? `Ano: ${f.release_date.slice(0, 4)}` : "",
      actions: [
        favorito
          ? {
              label: "❌ Remover",
              type: "remove",
              onClick: async ev => {
                await fetch(`/api/favoritos/${encodeURIComponent(f.id)}`, { method: "DELETE" })
                renderFilmes(filmesCache)
              }
            }
          : {
              label: "⭐ Favoritar",
              type: "fav",
              onClick: async ev => {
                await fetch("/api/favoritos", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ filme: { id: f.id, title: f.title, poster } })
                })
                renderFilmes(filmesCache)
              }
            }
      ]
    })

    div.appendChild(card)
  })

  renderPagination("tmdb-pagination", filmesPaginaAtual, totalPages, page => {
    filmesPaginaAtual = Math.max(1, Math.min(page, totalPages))
    renderFilmes(filmesCache)
    // keep user's scroll position roughly where it was
    const panel = document.getElementById("tmdb-results")
    if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" })
  })
}

document.getElementById("tmdb-search-form").onsubmit = async e => {
  e.preventDefault()
  const q = document.getElementById("tmdb-search-input").value.trim()
  if (!q) return
  logMessage("Buscando filmes...")
  filmesPaginaAtual = 1
  const filmes = await fetchJson(`/api/tmdb/search?q=${encodeURIComponent(q)}`)
  if (filmes) renderFilmes(filmes)
}

document.getElementById("tmdb-popular-btn").onclick = async () => {
  logMessage("Buscando populares...")
  filmesPaginaAtual = 1
  const filmes = await fetchJson("/api/tmdb/popular")
  if (filmes) renderFilmes(filmes)
}


let livrosPaginaAtual = 1
let livrosPorPagina = 6
let livrosCache = []

document.getElementById("openlibrary-search-form").onsubmit = async e => {
  e.preventDefault()
  const q = document.getElementById("openlibrary-search-input").value.trim()
  if (!q) return
  logMessage("Buscando livros...")
  livrosPaginaAtual = 1
  const livros = await fetchJson(`/api/openlibrary/search?q=${encodeURIComponent(q)}`)
  if (livros) renderLivros(livros)
}

async function renderLivros(lista) {
  livrosCache = lista || []
  const favs = await getFavoritos()

  const totalPages = Math.max(1, Math.ceil(lista.length / livrosPorPagina))
  if (livrosPaginaAtual > totalPages) livrosPaginaAtual = totalPages
  const start = (livrosPaginaAtual - 1) * livrosPorPagina
  const itensPag = lista.slice(start, start + livrosPorPagina)

  const div = document.getElementById("openlibrary-results")
  div.innerHTML = ""

  itensPag.forEach(l => {
    const id =
      l.key ||
      l.cover_edition_key ||
      (l.edition_key && l.edition_key[0]) ||
      (l.isbn && l.isbn[0]) ||
      (l.cover_i ? `cover_${l.cover_i}` : l.title)

    const cover = l.cover_i
      ? `https://covers.openlibrary.org/b/id/${l.cover_i}-L.jpg`
      : "https://via.placeholder.com/400x600?text=Sem+Imagem"

    const favorito = isFavorito(id, favs)

    const card = createCard({
      img: cover,
      title: l.title,
      meta: l.author_name ? l.author_name[0] : "",
      actions: [
        favorito
          ? {
              label: "❌ Remover",
              type: "remove",
              onClick: async ev => {
                await fetch(`/api/favoritos/${encodeURIComponent(id)}`, { method: "DELETE" })
                renderLivros(livrosCache)
              }
            }
          : {
              label: "⭐ Favoritar",
              type: "fav",
              onClick: async ev => {
                await fetch("/api/favoritos", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ livro: { id, title: l.title, poster: cover } })
                })
                renderLivros(livrosCache)
              }
            }
      ]
    })

    div.appendChild(card)
  })

  renderPagination("openlibrary-pagination", livrosPaginaAtual, totalPages, page => {
    livrosPaginaAtual = Math.max(1, Math.min(page, totalPages))
    renderLivros(livrosCache)
    const panel = document.getElementById("openlibrary-results")
    if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" })
  })
}


document.getElementById("btnCarregarFavoritos").onclick = carregarFavoritos

async function carregarFavoritos() {
  const div = document.getElementById("favoritos-list")
  div.innerHTML = ""
  const favs = await getFavoritos()

  if (favs.length === 0) {
    div.innerHTML = `<div class="meta">Nenhum favorito.</div>`
    return
  }

  favs.forEach(f => {
    const card = createCard({
      img: f.poster,
      title: f.title,
      meta: "",
      actions: [
        {
          label: "❌ Remover",
          type: "remove",
          onClick: async () => {
            await fetch(`/api/favoritos/${encodeURIComponent(f.id)}`, { method: "DELETE" })
            carregarFavoritos()
          }
        }
      ]
    })

    div.appendChild(card)
  })
}
