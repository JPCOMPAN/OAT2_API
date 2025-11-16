function logMessage(msg, json=null){
  const log = document.getElementById("log")
  const t = new Date().toLocaleTimeString()
  log.textContent = `[${t}] ${msg}\n` + (json?JSON.stringify(json,null,2)+"\n\n":"") + log.textContent
}

document.getElementById("btnClear").onclick = () => {
  document.getElementById("log").textContent = "Pronto."
}

function createCard({img,title,meta,actions=[]}){
  const c = document.createElement("div")
  c.className = "item"
  c.innerHTML = `
    <img class="thumb" loading="lazy" src="${img}">
    <div class="content">
      <h4 class="title">${title}</h4>
      <p class="meta">${meta||""}</p>
      <div class="actions"></div>
    </div>
  `
  const a = c.querySelector(".actions")
  actions.forEach(x=>{
    const b = document.createElement("button")
    b.className = "chip"
    if(x.type==="fav") b.classList.add("fav")
    if(x.type==="remove") b.classList.add("remove")
    b.textContent = x.label
    if(x.attrs) Object.keys(x.attrs).forEach(k=>b.setAttribute(k,x.attrs[k]))
    b.onclick = x.onClick
    a.appendChild(b)
  })
  c.querySelector(".thumb").onerror=()=>c.querySelector(".thumb").src="https://via.placeholder.com/400x600?text=Sem+Imagem"
  return c
}

async function fetchJson(url){
  try{
    const r = await fetch(url)
    if(!r.ok) throw new Error(await r.text())
    return await r.json()
  }catch(e){
    logMessage("Erro: "+e.message)
    return null
  }
}

async function getFavoritos(){
  return await fetchJson("/api/favoritos") || []
}

function isFavorito(id, favs){
  return favs.some(f=>f.id==id)
}

async function renderFilmes(lista){
  const favs = await getFavoritos()
  const div = document.getElementById("tmdb-results")
  div.innerHTML = ""
  lista.forEach(f=>{
    const poster = f.poster_path?`https://image.tmdb.org/t/p/w500${f.poster_path}`:"https://via.placeholder.com/400x600?text=Sem+Imagem"
    const favorito = isFavorito(f.id,favs)
    const card = createCard({
      img:poster,
      title:f.title,
      meta:f.release_date?`Ano: ${f.release_date.slice(0,4)}`:"",
      actions:[
        favorito
        ?{
          label:"❌ Remover",
          type:"remove",
          attrs:{ "data-id":f.id },
          onClick:async ev=>{
            await fetch(`/api/favoritos/${f.id}`,{method:"DELETE"})
            renderFilmes(lista)
          }
        }
        :{
          label:"⭐ Favoritar",
          type:"fav",
          attrs:{ "data-id":f.id },
          onClick:async ev=>{
            await fetch("/api/favoritos",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({filme:{id:f.id,title:f.title,poster}})})
            renderFilmes(lista)
          }
        }
      ]
    })
    div.appendChild(card)
  })
}

document.getElementById("tmdb-search-form").onsubmit = async e=>{
  e.preventDefault()
  const q = document.getElementById("tmdb-search-input").value.trim()
  logMessage("Buscando filmes...")
  const filmes = await fetchJson(`/api/tmdb/search?q=${encodeURIComponent(q)}`)
  if(filmes) renderFilmes(filmes)
}

document.getElementById("tmdb-popular-btn").onclick = async()=>{
  logMessage("Buscando populares...")
  const filmes = await fetchJson("/api/tmdb/popular")
  if(filmes) renderFilmes(filmes)
}

document.getElementById("openlibrary-search-form").onsubmit = async e=>{
  e.preventDefault()
  const q = document.getElementById("openlibrary-search-input").value.trim()
  logMessage("Buscando livros...")
  const livros = await fetchJson(`/api/openlibrary/search?q=${encodeURIComponent(q)}`)
  const div = document.getElementById("openlibrary-results")
  div.innerHTML = ""
  if(!livros) return
  livros.forEach(l=>{
    const cover = l.cover_i?`https://covers.openlibrary.org/b/id/${l.cover_i}-L.jpg`:"https://via.placeholder.com/400x600?text=Sem+Imagem"
    div.appendChild(createCard({img:cover,title:l.title,meta:l.author_name?l.author_name[0]:""}))
  })
}

document.getElementById("btnCarregarFavoritos").onclick = carregarFavoritos

async function carregarFavoritos(){
  const div = document.getElementById("favoritos-list")
  div.innerHTML = ""
  const favs = await getFavoritos()
  if(favs.length===0){
    div.innerHTML = `<div class="meta">Nenhum favorito.</div>`
    return
  }
  favs.forEach(f=>{
    const card = createCard({
      img:f.poster,
      title:f.title,
      meta:"",
      actions:[
        {
          label:"❌ Remover",
          type:"remove",
          attrs:{ "data-id":f.id },
          onClick:async()=>{
            await fetch(`/api/favoritos/${f.id}`,{method:"DELETE"})
            carregarFavoritos()
          }
        }
      ]
    })
    div.appendChild(card)
  })
}
