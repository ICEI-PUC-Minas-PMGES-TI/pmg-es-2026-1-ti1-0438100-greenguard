// ============================================================
// Página de parques (parques.html)
// - Lista parques do banco com média de avaliações + nº de avaliações
// - Só permite avaliar quem já fez check-in no parque
// - Avaliar abre um modal (estrelas + comentário), como o de posts
// - Botão para ver as avaliações (comentários) do parque
// - Favoritar parque
// Avaliar e favoritar contam para missões e creditam XP.
// ============================================================

const API_PARQUES = 'http://localhost:3000/api';
const IMAGENS_PARQUE = ['./assets/images/parque1.png', './assets/images/parque2.png', './assets/images/parque3.png'];

let parques = [];
let avaliacoes = [];
let favoritos = [];
let checkinsUsuario = [];     // nomes de parques onde o usuário fez check-in
let notaSelecionada = 0;
let parqueDoModal = null;

async function carregarTudo() {
  try {
    const u = getUsuario();
    const reqs = [
      fetch(`${API_PARQUES}/parques`),
      fetch(`${API_PARQUES}/avaliacoes`),
      fetch(`${API_PARQUES}/favoritos`)
    ];
    const [rP, rA, rF] = await Promise.all(reqs);
    parques = await rP.json();
    avaliacoes = await rA.json();
    favoritos = await rF.json();

    if (u) {
      const rC = await fetch(`${API_PARQUES}/checkins?usuario_id=${u.id}`);
      const checks = await rC.json();
      checkinsUsuario = checks.map(c => (c.parque || '').trim().toLowerCase());
    } else {
      checkinsUsuario = [];
    }

    aplicarParametrosURL();
    await aplicarFiltros();
  } catch (e) {
    console.error('Erro ao carregar parques:', e);
  }
}

function mediaParque(parqueId) {
  const notas = avaliacoes.filter(a => a.parque_id === parqueId).map(a => a.nota);
  if (!notas.length) return { media: 0, total: 0 };
  const media = notas.reduce((a, b) => a + b, 0) / notas.length;
  return { media: Math.round(media * 10) / 10, total: notas.length };
}

function avaliacaoDoUsuario(parqueId) {
  const u = getUsuario();
  if (!u) return null;
  return avaliacoes.find(a => a.parque_id === parqueId && a.usuario_id === u.id) || null;
}

function ehFavorito(parqueId) {
  const u = getUsuario();
  if (!u) return null;
  return favoritos.find(f => f.parque_id === parqueId && f.usuario_id === u.id) || null;
}

function fezCheckin(nomeParque) {
  return checkinsUsuario.includes((nomeParque || '').trim().toLowerCase());
}

function estrelasDisplay(media) {
  let html = '';
  const cheias = Math.round(media);
  for (let i = 1; i <= 5; i++) {
    html += `<i class="bi ${i <= cheias ? 'bi-star-fill' : 'bi-star'}"></i>`;
  }
  return html;
}

function renderizarParques(lista) {
  const section = document.querySelector('.cards-section');
  if (!section) return;
  const dados = lista || parques;

  if (!dados.length) {
    section.innerHTML = '<p style="padding:40px;color:#777;">Nenhum parque encontrado com esses filtros.</p>';
    return;
  }

  section.innerHTML = dados.map((p, idx) => {
    const { media, total } = mediaParque(p.id);
    const fav = ehFavorito(p.id);
    const jaAvaliou = avaliacaoDoUsuario(p.id);
    const mapsUrl = `https://www.google.com/maps?q=${p.lat},${p.lng}`;

    return `
      <div class="park-card visivel">
        <div class="card-img">
          <img src="${IMAGENS_PARQUE[idx % 3]}" alt="${p.nome}">
        </div>
        <div class="card-body">
          <h3 class="card-title">${p.nome}</h3>

          <div class="card-rating">
            <div class="stars-display">${estrelasDisplay(media)}</div>
            <button class="rating-count" data-parque="${p.id}">
              ${total ? `${media.toFixed(1)} · ${total} avaliaç${total === 1 ? 'ão' : 'ões'}` : 'Sem avaliações'}
            </button>
          </div>

          <div class="card-botoes">
            <button class="btn-avaliar" data-parque="${p.id}">
              <i class="bi bi-star"></i> ${jaAvaliou ? 'Editar avaliação' : 'Avaliar'}
            </button>
            <button class="btn-favorito ${fav ? 'ativo' : ''}" data-parque="${p.id}" title="Favoritar">
              <i class="bi ${fav ? 'bi-heart-fill' : 'bi-heart'}"></i>
            </button>
          </div>

          <button class="btn-card" onclick="window.open('${mapsUrl}', '_blank')">Me leve até lá!</button>
        </div>
      </div>`;
  }).join('');

  ativarBotoes();
}

function ativarBotoes() {
  document.querySelectorAll('.btn-avaliar').forEach(btn => {
    btn.addEventListener('click', () => abrirModalAvaliar(Number(btn.dataset.parque)));
  });
  document.querySelectorAll('.rating-count').forEach(btn => {
    btn.addEventListener('click', () => abrirModalAvaliacoes(Number(btn.dataset.parque)));
  });
  document.querySelectorAll('.btn-favorito').forEach(btn => {
    btn.addEventListener('click', () => alternarFavorito(Number(btn.dataset.parque)));
  });
}

// ── Modal de avaliação ──
function abrirModalAvaliar(parqueId) {
  const u = getUsuario();
  if (!u) { abrirModalLogin(); return; }

  const parque = parques.find(p => p.id === parqueId);
  if (!parque) return;

  if (!fezCheckin(parque.nome)) {
    alert('Você precisa fazer check-in neste parque (na sua página de perfil) antes de avaliá-lo.');
    return;
  }

  parqueDoModal = parque;
  document.getElementById('avaliarNomeParque').textContent = parque.nome;

  const existente = avaliacaoDoUsuario(parqueId);
  notaSelecionada = existente ? existente.nota : 0;
  document.getElementById('comentarioAvaliar').value = existente ? (existente.comentario || '') : '';
  pintarEstrelas(notaSelecionada);

  document.getElementById('modalAvaliar').classList.add('active');
}

function pintarEstrelas(nota) {
  document.querySelectorAll('#estrelasAvaliar i').forEach(estrela => {
    const n = Number(estrela.dataset.nota);
    estrela.className = n <= nota ? 'bi bi-star-fill' : 'bi bi-star';
  });
}

function configurarEstrelasModal() {
  document.querySelectorAll('#estrelasAvaliar i').forEach(estrela => {
    const n = Number(estrela.dataset.nota);
    estrela.addEventListener('mouseenter', () => pintarEstrelas(n));
    estrela.addEventListener('mouseleave', () => pintarEstrelas(notaSelecionada));
    estrela.addEventListener('click', () => { notaSelecionada = n; pintarEstrelas(n); });
  });
}

async function enviarAvaliacao() {
  const u = getUsuario();
  if (!u || !parqueDoModal) return;
  if (notaSelecionada < 1) { alert('Selecione de 1 a 5 estrelas.'); return; }

  const comentario = document.getElementById('comentarioAvaliar').value.trim();
  const existente = avaliacaoDoUsuario(parqueDoModal.id);

  try {
    if (existente) {
      await fetch(`${API_PARQUES}/avaliacoes/${existente.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nota: notaSelecionada, comentario })
      });
      existente.nota = notaSelecionada;
      existente.comentario = comentario;
    } else {
      const res = await fetch(`${API_PARQUES}/avaliacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parque_id: parqueDoModal.id,
          usuario_id: u.id,
          usuario: u.nome,
          nota: notaSelecionada,
          comentario,
          data: new Date().toISOString()
        })
      });
      avaliacoes.push(await res.json());
      if (typeof registrarAcao === 'function') registrarAcao('avaliacao');
    }

    document.getElementById('modalAvaliar').classList.remove('active');
    aplicarFiltros();
  } catch {
    alert('Erro ao salvar avaliação. Verifique se o servidor está rodando.');
  }
}

// ── Modal de visualização das avaliações ──
function abrirModalAvaliacoes(parqueId) {
  const parque = parques.find(p => p.id === parqueId);
  if (!parque) return;

  document.getElementById('avaliacoesNomeParque').textContent = parque.nome;
  const lista = document.getElementById('listaAvaliacoes');
  const doParque = avaliacoes.filter(a => a.parque_id === parqueId);

  if (!doParque.length) {
    lista.innerHTML = '<p class="sem-avaliacoes">Este parque ainda não tem avaliações. Seja o primeiro!</p>';
  } else {
    lista.innerHTML = doParque.map(a => {
      const data = a.data ? new Date(a.data).toLocaleDateString('pt-BR') : '';
      const estrelas = estrelasDisplay(a.nota);
      return `
        <div class="avaliacao-item">
          <div class="avaliacao-topo">
            <span class="avaliacao-autor">${a.usuario || 'Usuário'}</span>
            <span class="avaliacao-estrelas">${estrelas}</span>
          </div>
          ${a.comentario ? `<p class="avaliacao-comentario">${a.comentario}</p>` : ''}
          ${data ? `<span class="avaliacao-data">${data}</span>` : ''}
        </div>`;
    }).join('');
  }

  document.getElementById('modalAvaliacoes').classList.add('active');
}

// ── Favoritos ──
async function alternarFavorito(parqueId) {
  const u = getUsuario();
  if (!u) { abrirModalLogin(); return; }

  const existente = ehFavorito(parqueId);
  try {
    if (existente) {
      await fetch(`${API_PARQUES}/favoritos/${existente.id}`, { method: 'DELETE' });
      favoritos = favoritos.filter(f => f.id !== existente.id);
    } else {
      const res = await fetch(`${API_PARQUES}/favoritos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: u.id, parque_id: parqueId })
      });
      favoritos.push(await res.json());
      if (typeof registrarAcao === 'function') registrarAcao('favorito');
    }
    aplicarFiltros();
  } catch {
    alert('Erro ao atualizar favoritos. Verifique se o servidor está rodando.');
  }
}

// ── Eventos dos modais ──
document.addEventListener('DOMContentLoaded', () => {
  configurarEstrelasModal();
  document.getElementById('enviarAvaliacao').addEventListener('click', enviarAvaliacao);
  document.getElementById('fecharAvaliar').addEventListener('click', () => {
    document.getElementById('modalAvaliar').classList.remove('active');
  });
  document.getElementById('fecharAvaliacoes').addEventListener('click', () => {
    document.getElementById('modalAvaliacoes').classList.remove('active');
  });
  [document.getElementById('modalAvaliar'), document.getElementById('modalAvaliacoes')].forEach(ov => {
    ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('active'); });
  });
});

// ============================================================
// Filtros em tempo real (busca, atividade, turno, distância)
// ============================================================

const filtros = { busca: '', atividade: '', turno: '', distancia: 0 };
let userPosParques = null;

function distanciaKm(p) {
  if (!userPosParques) return null;
  return calcularDistancia(userPosParques.lat, userPosParques.lng, p.lat, p.lng) / 1000;
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function pedirLocalizacao() {
  return new Promise(resolve => {
    if (userPosParques) return resolve(userPosParques);
    if (!navigator.geolocation) { alert('Seu navegador não suporta geolocalização.'); return resolve(null); }
    navigator.geolocation.getCurrentPosition(
      pos => { userPosParques = { lat: pos.coords.latitude, lng: pos.coords.longitude }; resolve(userPosParques); },
      () => { alert('Não foi possível obter sua localização para filtrar por distância.'); resolve(null); }
    );
  });
}

async function aplicarFiltros() {
  // Se for filtrar por distância, garante a localização
  if (filtros.distancia && !userPosParques) await pedirLocalizacao();

  let lista = parques.slice();

  if (filtros.busca) {
    const t = filtros.busca.toLowerCase();
    lista = lista.filter(p => p.nome.toLowerCase().includes(t));
  }
  if (filtros.atividade) {
    lista = lista.filter(p => (p.atividades || []).includes(filtros.atividade));
  }
  if (filtros.turno) {
    lista = lista.filter(p => (p.turnos || []).includes(filtros.turno));
  }
  if (filtros.distancia && userPosParques) {
    lista = lista.filter(p => distanciaKm(p) <= filtros.distancia);
  }

  renderizarParques(lista);
}

// Lê os filtros vindos da home (querystring)
function aplicarParametrosURL() {
  const p = new URLSearchParams(window.location.search);
  if (p.get('busca'))     filtros.busca = p.get('busca');
  if (p.get('atividade')) filtros.atividade = p.get('atividade').toLowerCase();
  if (p.get('turno'))     filtros.turno = p.get('turno').toLowerCase();
  if (p.get('distancia')) filtros.distancia = p.get('distancia').includes('5') ? 5 : 10;

  // Reflete na UI
  const busca = document.querySelector('.search-container input');
  if (busca && filtros.busca) busca.value = filtros.busca;
  const grupos = document.querySelectorAll('#filter-panel .filter-group');
  if (grupos[1] && filtros.atividade) grupos[1].querySelector('.filter-header span').innerText = cap(filtros.atividade);
  if (grupos[0] && filtros.turno)     grupos[0].querySelector('.filter-header span').innerText = cap(filtros.turno);
  if (grupos[2] && filtros.distancia) grupos[2].querySelector('.filter-header span').innerText = `Até ${filtros.distancia}km`;
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ── Controles da UI de filtro ──
function toggleFilters() { document.getElementById('filter-panel').classList.toggle('filter-show'); }
function toggleDropdown(header) { header.nextElementSibling.classList.toggle('dropdown-closed'); }

function selectOption(li) {
  const grupo = li.closest('.filter-group');
  grupo.querySelector('.filter-header span').innerText = li.innerText.trim();
  grupo.querySelector('.filter-options').classList.add('dropdown-closed');

  const grupos = [...document.querySelectorAll('#filter-panel .filter-group')];
  const idx = grupos.indexOf(grupo);
  const valor = li.innerText.trim().toLowerCase();

  if (idx === 0) filtros.turno = valor;
  else if (idx === 1) filtros.atividade = valor;
  else if (idx === 2) filtros.distancia = valor.includes('5') ? 5 : 10;

  aplicarFiltros();
}

const buscaParques = document.querySelector('.search-container input');
if (buscaParques) {
  buscaParques.addEventListener('input', () => {
    filtros.busca = buscaParques.value.trim();
    aplicarFiltros();
  });
}

carregarTudo();
