
const BANCO_MISSOES = [
  { id: 'm1',  icone: '🌿', titulo: 'Faça 5 check-ins em parques',         total: 5,  pts: 50 },
  { id: 'm2',  icone: '💬', titulo: 'Comente em 10 posts do fórum',         total: 10, pts: 40 },
  { id: 'm3',  icone: '📸', titulo: 'Publique 3 fotos em áreas verdes',     total: 3,  pts: 30 },
  { id: 'm4',  icone: '❤️', titulo: 'Curta 20 posts da comunidade',         total: 20, pts: 20 },
  { id: 'm5',  icone: '🗺️', titulo: 'Visite 2 parques diferentes',          total: 2,  pts: 35 },
  { id: 'm6',  icone: '📝', titulo: 'Faça 3 posts no fórum',                total: 3,  pts: 30 },
  { id: 'm7',  icone: '🤝', titulo: 'Responda 5 comentários de outros usuários', total: 5, pts: 25 },
  { id: 'm8',  icone: '🌳', titulo: 'Adicione 2 parques aos favoritos',     total: 2,  pts: 20 },
  { id: 'm9',  icone: '🏃', titulo: 'Registre 3 atividades em parques',     total: 3,  pts: 45 },
  { id: 'm10', icone: '⭐', titulo: 'Avalie 4 parques visitados',            total: 4,  pts: 35 },
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
function getChaveStorage() {
  return `gg_missoes_${getSemanaAtual()}`;
}

function carregarProgresso() {
  try {
    const raw = localStorage.getItem(getChaveStorage());
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function salvarProgresso(progresso) {
  localStorage.setItem(getChaveStorage(), JSON.stringify(progresso));
}
function getMissoesDaSemana() {
  const semana = getSemanaAtual();
  const embaralhadas = shuffleComSemente(BANCO_MISSOES, semana);
  return embaralhadas.slice(0, MISSOES_POR_SEMANA);
}
function getHistorico() {
  try {
    const raw = localStorage.getItem('gg_historico_missoes');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function adicionarAoHistorico(missao) {
  const historico = getHistorico();
  const agora = new Date();
  const data = agora.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  historico.unshift({ desc: missao.titulo, pts: missao.pts, data, semana: getSemanaAtual() });
  localStorage.setItem('gg_historico_missoes', JSON.stringify(historico.slice(0, 30)));
}
function renderizarMissoesSemana() {
  const container = document.getElementById('painel-semanal');
  const missoes = getMissoesDaSemana();
  const progresso = carregarProgresso();

  container.innerHTML = missoes.map(m => {
    const atual = progresso[m.id] || 0;
    const concluida = atual >= m.total;
    const pct = Math.min(Math.round((atual / m.total) * 100), 100);
    const barColor = concluida ? '#aaa' : '#00CF53';
    const cardClass = concluida ? 'missao-semanal-card concluida' : 'missao-semanal-card';
    const textoProgresso = concluida
      ? `${m.total} de ${m.total} — Concluída!`
      : `${atual} de ${m.total}`;

    const btnSimular = !concluida
      ? `<button class="btn-simular-progresso" onclick="simularProgresso('${m.id}')" title="Simular progresso">+1</button>`
      : '';

    return `
      <div class="${cardClass}" id="card-missao-${m.id}">
        <div class="missao-icone">${m.icone}</div>
        <div class="missao-info">
          <div class="missao-titulo">${m.titulo}</div>
          <div class="missao-barra-fundo">
            <div class="missao-barra-progresso" style="width:${pct}%; background:${barColor};"></div>
          </div>
          <div class="missao-progresso-texto">${textoProgresso}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
          <div class="missao-pts-badge">+${m.pts} pts</div>
          ${btnSimular}
        </div>
      </div>`;
  }).join('');
}

function simularProgresso(id) {
  const missoes = getMissoesDaSemana();
  const missao = missoes.find(m => m.id === id);
  if (!missao) return;

  const progresso = carregarProgresso();
  const atual = progresso[id] || 0;

  if (atual < missao.total) {
    progresso[id] = atual + 1;
    salvarProgresso(progresso);

    if (progresso[id] >= missao.total) {
      adicionarAoHistorico(missao);
      renderizarHistorico(); // atualiza histórico também
    }

    renderizarMissoesSemana();
  }
}
function renderizarHistorico() {
  const container = document.getElementById('painel-historico');
  const historico = getHistorico();

  const totalPts = historico.reduce((acc, i) => acc + i.pts, 0);

  const resumo = `
    <div id="resumo-pontos">
      <div>
        <div class="label">Total de pontos ganhos</div>
        <div class="valor">${totalPts.toLocaleString('pt-BR')} pts</div>
      </div>
      <i class="bi bi-star-fill" style="font-size:32px; opacity:0.6;"></i>
    </div>`;

  if (historico.length === 0) {
    container.innerHTML = resumo + `
      <div style="text-align:center; color:#aaa; padding: 30px 0; font-size:13px;">
        Nenhuma missão concluída ainda.<br>Complete missões semanais para ver seu histórico!
      </div>`;
    return;
  }

  const grupos = {};
  historico.forEach(item => {
    const chave = item.semana || 'Semanas anteriores';
    if (!grupos[chave]) grupos[chave] = [];
    grupos[chave].push(item);
  });

  const semanaAtual = getSemanaAtual();
  function rotuloSemana(chave) {
    if (chave === semanaAtual) return 'Esta semana';
    return `Semana ${chave.split('-W')[1]} de ${chave.split('-W')[0]}`;
  }

  const gruposHTML = Object.entries(grupos).map(([chave, itens]) => {
    const itensHTML = itens.map(i => `
      <div class="historico-item">
        <div class="historico-check"><i class="bi bi-check-lg"></i></div>
        <div class="historico-desc">${i.desc}</div>
        <div class="historico-meta">
          <div class="historico-pts">+${i.pts} pts</div>
          <div class="historico-data">${i.data}</div>
        </div>
      </div>`).join('');
    return `<div class="historico-grupo-label">${rotuloSemana(chave)}</div>${itensHTML}`;
  }).join('');

  container.innerHTML = resumo + gruposHTML;
}
function abrirModalMissoes() {
  document.getElementById('modal-missoes-overlay').classList.add('aberto');
  document.body.style.overflow = 'hidden';
}

function fecharModal() {
  document.getElementById('modal-missoes-overlay').classList.remove('aberto');
  document.body.style.overflow = '';
}

function fecharModalOverlay(e) {
  if (e.target === document.getElementById('modal-missoes-overlay')) fecharModal();
}

function trocarAba(aba, btn) {
  document.querySelectorAll('.painel-aba').forEach(p => p.classList.remove('ativo'));
  document.querySelectorAll('.modal-aba').forEach(b => b.classList.remove('ativa'));
  document.getElementById('painel-' + aba).classList.add('ativo');
  btn.classList.add('ativa');
}
document.addEventListener('DOMContentLoaded', () => {
  renderizarMissoesSemana();
  renderizarHistorico();

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') fecharModal();
  });
});
