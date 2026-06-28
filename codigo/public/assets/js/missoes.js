// ============================================================
// Interface do modal de missões (perfil.html).
// O núcleo (banco de missões, progresso, XP) está em missoes-core.js,
// que precisa ser carregado ANTES deste arquivo.
// ============================================================

function renderizarMissoesSemana() {
  const container = document.getElementById('painel-semanal');
  if (!container) return;

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
        <div class="missao-pts-badge">+${m.pts} pts</div>
      </div>`;
  }).join('');
}

function renderizarHistorico() {
  const container = document.getElementById('painel-historico');
  if (!container) return;

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
  renderizarMissoesSemana();
  renderizarHistorico();
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
