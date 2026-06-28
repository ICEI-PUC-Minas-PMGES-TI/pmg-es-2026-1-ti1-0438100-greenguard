// ============================================================
// Núcleo do sistema de missões — carregado em TODAS as páginas.
// Banco de missões, progresso semanal (localStorage) e a função
// registrarAcao() que conecta as ações reais (curtir, postar,
// check-in, avaliar, favoritar) às missões.
//
// O XP é a fonte da verdade no BANCO (cada usuário tem seu xp).
// A tabela de níveis também vem do banco (/niveis), como em jogos.
// Cada missão concluída credita XP UMA ÚNICA vez (controle por semana).
// ============================================================

const GG_API = 'http://localhost:3000/api';

const BANCO_MISSOES = [
  { id: 'm1',  tipo: 'checkin',   icone: '🌿', titulo: 'Faça 1 check-in em um parque',     total: 1, pts: 20 },
  { id: 'm2',  tipo: 'curtida',   icone: '❤️', titulo: 'Curta 3 posts do fórum',           total: 3, pts: 15 },
  { id: 'm3',  tipo: 'post',      icone: '📝', titulo: 'Faça 1 post no fórum',             total: 1, pts: 20 },
  { id: 'm4',  tipo: 'foto',      icone: '📸', titulo: 'Publique um post com foto',         total: 1, pts: 15 },
  { id: 'm5',  tipo: 'avaliacao', icone: '⭐', titulo: 'Avalie 2 parques',                  total: 2, pts: 20 },
  { id: 'm6',  tipo: 'favorito',  icone: '🌳', titulo: 'Adicione 1 parque aos favoritos',   total: 1, pts: 10 },
  { id: 'm7',  tipo: 'curtida',   icone: '👍', titulo: 'Curta 5 posts da comunidade',       total: 5, pts: 25 },
  { id: 'm8',  tipo: 'checkin',   icone: '🗺️', titulo: 'Faça 2 check-ins',                  total: 2, pts: 30 },
  { id: 'm9',  tipo: 'post',      icone: '💬', titulo: 'Faça 2 posts no fórum',            total: 2, pts: 30 },
  { id: 'm10', tipo: 'avaliacao', icone: '🌟', titulo: 'Avalie 3 parques',                  total: 3, pts: 30 },
];

const MISSOES_POR_SEMANA = 5;

function getSemanaAtual() {
  const now = new Date();
  const ano = now.getFullYear();
  const inicio = new Date(ano, 0, 1);
  const semana = Math.ceil(((now - inicio) / 86400000 + inicio.getDay() + 1) / 7);
  return `${ano}-W${semana}`;
}

function shuffleComSemente(arr, semente) {
  let seed = [...semente].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getMissoesDaSemana() {
  return shuffleComSemente(BANCO_MISSOES, getSemanaAtual()).slice(0, MISSOES_POR_SEMANA);
}

function getChaveStorage()   { return `gg_missoes_${getSemanaAtual()}`; }
function getChavePremiadas() { return `gg_premiadas_${getSemanaAtual()}`; }

function carregarProgresso() {
  try { const raw = localStorage.getItem(getChaveStorage()); return raw ? JSON.parse(raw) : {}; }
  catch { return {}; }
}
function salvarProgresso(p) { localStorage.setItem(getChaveStorage(), JSON.stringify(p)); }

function getPremiadas() {
  try { const raw = localStorage.getItem(getChavePremiadas()); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}
function salvarPremiadas(p) { localStorage.setItem(getChavePremiadas(), JSON.stringify(p)); }

function getHistorico() {
  try { const raw = localStorage.getItem('gg_historico_missoes'); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}
function adicionarAoHistorico(missao) {
  const historico = getHistorico();
  const data = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  historico.unshift({ desc: missao.titulo, pts: missao.pts, data, semana: getSemanaAtual() });
  localStorage.setItem('gg_historico_missoes', JSON.stringify(historico.slice(0, 30)));
}

// ── Tabela de níveis (vem do banco) ──
let NIVEIS_CACHE = null;
async function getNiveis() {
  if (NIVEIS_CACHE) return NIVEIS_CACHE;
  try {
    const r = await fetch(`${GG_API}/niveis`);
    NIVEIS_CACHE = (await r.json()).sort((a, b) => a.xp_total - b.xp_total);
  } catch {
    NIVEIS_CACHE = [{ nivel: 1, xp_total: 0 }];
  }
  return NIVEIS_CACHE;
}

// Dado um XP total e a tabela, calcula nível e progresso no nível atual.
function calcNivel(xp, niveis) {
  const ord = [...niveis].sort((a, b) => a.xp_total - b.xp_total);
  let atual = ord[0];
  let prox = null;
  for (let i = 0; i < ord.length; i++) {
    if (xp >= ord[i].xp_total) { atual = ord[i]; prox = ord[i + 1] || null; }
  }
  const base = atual.xp_total;
  const xpNoNivel = xp - base;
  const xpNecessario = prox ? (prox.xp_total - base) : xpNoNivel;
  const pct = prox ? Math.min(Math.round((xpNoNivel / (prox.xp_total - base)) * 100), 100) : 100;
  return { nivel: atual.nivel, xpNoNivel, xpNecessario, pct, max: !prox };
}

// ── Crédito de XP (sempre no banco; sessão só espelha) ──
async function creditarXP(pontos) {
  if (typeof getUsuario !== 'function') return;
  const usuario = getUsuario();
  if (!usuario) return;

  // Pega o XP mais recente do banco (evita perder pontos entre abas)
  let atualXp = usuario.xp || 0;
  try {
    const r = await fetch(`${GG_API}/usuarios/${usuario.id}`);
    const dbu = await r.json();
    if (typeof dbu.xp === 'number') atualXp = dbu.xp;
  } catch {}

  const novoXp = atualXp + pontos;
  const niveis = await getNiveis();
  const info = calcNivel(novoXp, niveis);

  try {
    await fetch(`${GG_API}/usuarios/${usuario.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ xp: novoXp, nivel: info.nivel })
    });
  } catch (e) { console.error('Erro ao creditar XP:', e); }

  // Espelha na sessão e avisa a UI
  usuario.xp = novoXp;
  usuario.nivel = info.nivel;
  salvarSessao(usuario);
  window.dispatchEvent(new CustomEvent('xp-atualizado', { detail: { xp: novoXp, nivel: info.nivel } }));
}

// ── Credita as missões concluídas que ainda não foram premiadas ──
async function sincronizarRecompensas() {
  const missoes = getMissoesDaSemana();
  const progresso = carregarProgresso();
  const premiadas = getPremiadas();

  let xpGanho = 0;
  const novas = [];

  missoes.forEach(m => {
    const completa = (progresso[m.id] || 0) >= m.total;
    if (completa && !premiadas.includes(m.id)) {
      premiadas.push(m.id);
      adicionarAoHistorico(m);
      xpGanho += m.pts;
      novas.push(m);
    }
  });

  salvarPremiadas(premiadas);

  if (xpGanho > 0) {
    await creditarXP(xpGanho);
    novas.forEach(m => { if (typeof mostrarToastMissao === 'function') mostrarToastMissao(m); });
    if (typeof renderizarHistorico === 'function') renderizarHistorico();
  }
}

// ── Registra uma ação real e avança as missões correspondentes ──
// tipo: 'checkin' | 'curtida' | 'post' | 'foto' | 'avaliacao' | 'favorito'
async function registrarAcao(tipo, quantidade = 1) {
  const missoes = getMissoesDaSemana().filter(m => m.tipo === tipo);
  if (missoes.length) {
    const progresso = carregarProgresso();
    missoes.forEach(m => {
      const atual = progresso[m.id] || 0;
      if (atual < m.total) progresso[m.id] = Math.min(atual + quantidade, m.total);
    });
    salvarProgresso(progresso);
  }

  await sincronizarRecompensas();

  if (typeof renderizarMissoesSemana === 'function') renderizarMissoesSemana();
  if (typeof renderizarHistorico === 'function') renderizarHistorico();
}

// ── Toast de missão concluída (qualquer página) ──
function mostrarToastMissao(missao) {
  let area = document.getElementById('gg-toast-area');
  if (!area) {
    area = document.createElement('div');
    area.id = 'gg-toast-area';
    area.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:999999;display:flex;flex-direction:column;gap:10px;';
    document.body.appendChild(area);
  }

  const toast = document.createElement('div');
  toast.style.cssText = `
    background:#00A843;color:white;padding:14px 18px;border-radius:12px;
    font-family:'Poppins',sans-serif;font-size:13px;box-shadow:0 8px 24px rgba(0,0,0,.25);
    display:flex;align-items:center;gap:10px;min-width:240px;max-width:320px;
    animation:gg-toast-in .3s ease;`;
  toast.innerHTML = `
    <span style="font-size:22px;">${missao.icone}</span>
    <div>
      <div style="font-weight:700;">Missão concluída!</div>
      <div style="opacity:.9;font-size:12px;">${missao.titulo} · +${missao.pts} XP</div>
    </div>`;

  if (!document.getElementById('gg-toast-style')) {
    const st = document.createElement('style');
    st.id = 'gg-toast-style';
    st.textContent = '@keyframes gg-toast-in{from{opacity:0;transform:translateX(40px);}to{opacity:1;transform:translateX(0);}}';
    document.head.appendChild(st);
  }

  area.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity .4s, transform .4s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// Ao carregar qualquer página, credita missões que já estavam completas
// mas ainda não tinham sido premiadas (ex.: metas que mudaram).
document.addEventListener('DOMContentLoaded', () => { sincronizarRecompensas(); });
