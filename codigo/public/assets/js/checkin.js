// ============================================================
// Check-in de parque (perfil.html)
// - Modal no estilo do fórum, com preview das fotos inseridas
// - Verificação de localização automática ao abrir (GPS)
// - Botão para tentar novamente caso falhe / esteja longe
// - Só libera o check-in dentro de RAIO_CHECKIN_METROS do parque
// ============================================================

// Raio máximo (em metros) para considerar o usuário "no parque".
const RAIO_CHECKIN_METROS = 200;

const abrirModal       = document.getElementById('btn-checkin');
const modalParque      = document.getElementById('modalParque');
const btnFecharCheckin = document.getElementById('fecharModal');

const campoNomeParque  = document.getElementById('campoNomeParque');
const listaParques     = document.getElementById('parqueListaCheckin');
const inputFotos       = document.getElementById('checkinFotos');
const preview          = document.getElementById('checkinPreview');
const locBox           = document.getElementById('checkinLocBox');
const locStatusSpan    = document.querySelector('#checkinLocStatus span');
const btnVerificarLoc  = document.getElementById('btnVerificarLoc');
const formulario       = document.querySelector('.form-parque');
const btnEnviar        = document.getElementById('btnEnviar');

let parquesCheckin = [];
let parqueSelecionado = null;
let userPos = null;            // { lat, lng }
let localizacaoValida = false;
let arquivosFoto = [];

// ── Carrega parques do banco ──
async function carregarParquesCheckin() {
  try {
    const res = await fetch('http://localhost:3000/api/parques');
    parquesCheckin = await res.json();
  } catch {
    parquesCheckin = [];
  }
}

// ── Status da verificação ──
function setStatus(estado, texto) {
  if (locBox) locBox.className = 'checkin-loc-box checkin-loc-' + estado;
  if (locStatusSpan) locStatusSpan.textContent = texto;
}

// ── Abrir / fechar modal ──
if (abrirModal) {
  abrirModal.addEventListener('click', () => {
    if (typeof getUsuario === 'function' && !getUsuario()) {
      alert('Você precisa estar logado para fazer check-in.');
      return;
    }
    modalParque.classList.add('active');
    if (!parquesCheckin.length) carregarParquesCheckin();
    resetarModal();
    solicitarLocalizacao();
  });
}

function fecharModalCheckin() {
  modalParque.classList.remove('active');
}

if (btnFecharCheckin) btnFecharCheckin.addEventListener('click', fecharModalCheckin);

modalParque.addEventListener('click', (e) => {
  if (e.target === modalParque) fecharModalCheckin();
});

function resetarModal() {
  parqueSelecionado = null;
  localizacaoValida = false;
  arquivosFoto = [];
  if (campoNomeParque) campoNomeParque.value = '';
  if (preview) preview.innerHTML = '';
  if (inputFotos) inputFotos.value = '';
  if (listaParques) { listaParques.innerHTML = ''; listaParques.style.display = 'none'; }
  btnEnviar.disabled = true;
}

// ── Geolocalização ──
function solicitarLocalizacao() {
  if (!navigator.geolocation) {
    setStatus('denied', 'Seu navegador não suporta geolocalização.');
    return;
  }
  setStatus('checking', 'Verificando sua localização...');
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      avaliarLocalizacao();
    },
    () => {
      userPos = null;
      localizacaoValida = false;
      btnEnviar.disabled = true;
      setStatus('denied', 'Não foi possível obter sua localização. Permita o acesso e tente novamente.');
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function avaliarLocalizacao() {
  if (!userPos) { solicitarLocalizacao(); return; }

  if (!parqueSelecionado) {
    localizacaoValida = false;
    btnEnviar.disabled = true;
    setStatus('idle', 'Localização obtida ✓. Agora escolha o parque acima.');
    return;
  }

  const dist = calcularDistancia(userPos.lat, userPos.lng, parqueSelecionado.lat, parqueSelecionado.lng);

  if (dist <= RAIO_CHECKIN_METROS) {
    localizacaoValida = true;
    btnEnviar.disabled = false;
    setStatus('ok', `Você está no ${parqueSelecionado.nome}! Pode fazer o check-in.`);
  } else {
    localizacaoValida = false;
    btnEnviar.disabled = true;
    setStatus('far', `Você está a ${Math.round(dist)} m do parque. Aproxime-se para fazer o check-in.`);
  }
}

if (btnVerificarLoc) btnVerificarLoc.addEventListener('click', solicitarLocalizacao);

// ── Autocomplete de parque ──
function renderizarSugestoes(termo) {
  if (!listaParques) return;
  const t = termo.trim().toLowerCase();
  if (!t) { listaParques.innerHTML = ''; listaParques.style.display = 'none'; return; }

  const filtrados = parquesCheckin.filter(p => p.nome.toLowerCase().includes(t)).slice(0, 8);
  listaParques.innerHTML = '';
  filtrados.forEach(p => {
    const li = document.createElement('li');
    li.textContent = p.nome;
    li.addEventListener('click', () => selecionarParque(p));
    listaParques.appendChild(li);
  });
  listaParques.style.display = filtrados.length ? 'block' : 'none';
}

function selecionarParque(parque) {
  parqueSelecionado = parque;
  campoNomeParque.value = parque.nome;
  listaParques.innerHTML = '';
  listaParques.style.display = 'none';
  avaliarLocalizacao();
}

if (campoNomeParque) {
  campoNomeParque.addEventListener('input', () => {
    parqueSelecionado = null;
    localizacaoValida = false;
    btnEnviar.disabled = true;
    renderizarSugestoes(campoNomeParque.value);
  });
}

document.addEventListener('click', (e) => {
  if (listaParques && campoNomeParque &&
      !campoNomeParque.contains(e.target) && !listaParques.contains(e.target)) {
    listaParques.style.display = 'none';
  }
});

// ── Preview das fotos ──
const MAX_FOTOS = 2;

if (inputFotos) {
  inputFotos.addEventListener('change', () => {
    arquivosFoto = Array.from(inputFotos.files).slice(0, MAX_FOTOS);
    if (inputFotos.files.length > MAX_FOTOS) {
      alert(`Você pode anexar no máximo ${MAX_FOTOS} fotos. Apenas as duas primeiras serão usadas.`);
    }
    preview.innerHTML = '';
    arquivosFoto.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        preview.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  });
}

// ── Distância entre coordenadas (Haversine) ──
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Envio do check-in ──
if (formulario) {
  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!parqueSelecionado) { alert('Escolha um parque da lista.'); return; }
    if (!localizacaoValida) { setStatus('far', 'Verifique sua localização antes de enviar.'); return; }

    const usuario = getUsuario();
    if (!usuario) { alert('Você precisa estar logado para fazer check-in.'); return; }

    btnEnviar.disabled = true;
    btnEnviar.textContent = 'Enviando...';

    try {
      // Faz upload de até 2 fotos, se houver
      const imagens = [];
      for (const arquivo of arquivosFoto.slice(0, MAX_FOTOS)) {
        const fd = new FormData();
        fd.append('imagem', arquivo);
        const up = await fetch('http://localhost:3000/upload', { method: 'POST', body: fd });
        if (up.ok) imagens.push((await up.json()).caminho);
      }

      await fetch('http://localhost:3000/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: usuario.id,
          usuario: usuario.nome,
          parque: parqueSelecionado.nome,
          data: new Date().toISOString(),
          imagens: imagens
        })
      });

      if (typeof registrarAcao === 'function') registrarAcao('checkin');

      fecharModalCheckin();
      resetarModal();
      alert('Check-in realizado com sucesso!');
      if (typeof carregarCheckins === 'function') carregarCheckins();
    } catch {
      alert('Erro ao salvar check-in. Verifique se o servidor está rodando.');
    } finally {
      btnEnviar.textContent = 'Fazer Check-in';
    }
  });
}

carregarParquesCheckin();
