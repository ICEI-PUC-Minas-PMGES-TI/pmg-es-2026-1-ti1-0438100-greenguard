// Imagem do parque: a cadastrada, senão foto de parque variada e estável por id
function imagemDoParque(p) {
    if (p.imagem && p.imagem.trim()) return p.imagem;
    return `https://loremflickr.com/600/400/park,nature/?lock=${p.id}`;
}

async function carregarPreviewForum() {
    try {
        const [posts, usuarios] = await Promise.all([
            fetch('http://localhost:3000/api/posts').then(r => r.json()),
            fetch('http://localhost:3000/api/usuarios').then(r => r.json())
        ]);
        const usuariosMap = Object.fromEntries(usuarios.map(u => [u.id, u]));

        const container = document.querySelector('.forum_denuncia');
        if (!container) return;

        const botao = container.querySelector('button');
        container.innerHTML = '';

        const ultimos = posts.slice(-2).reverse();

        ultimos.forEach(post => {
            const agora = new Date();
            const dataPost = new Date(post.data);
            const diffMin = Math.floor((agora - dataPost) / 60000);
            const diffHoras = Math.floor(diffMin / 60);
            const diffDias = Math.floor(diffHoras / 24);

            let tempo;
            if (diffMin < 60) tempo = `há ${diffMin}min`;
            else if (diffHoras < 24) tempo = `há ${diffHoras}h`;
            else tempo = `há ${diffDias}d`;

            const article = document.createElement('article');
            article.className = 'post_forum_previa';

            article.innerHTML = `
                <p class="tempo_post">${tempo}</p>
                <h3>${post.titulo}</h3>

                <div class="row_txt_img">

                    <div>
                        <div class="row_foto_nome">
                            <figure>
                                <img src="${(usuariosMap[post.autor_id] && usuariosMap[post.autor_id].foto_perfil) || './assets/images/user-imagem.png'}" alt="${post.autor}" onerror="this.src='./assets/images/user-imagem.png'">
                            </figure>
                            <h4>${post.autor}</h4>
                        </div>
                        <p>${post.descricao}</p>
                    </div>

                    <div>
                        <img class="img_post" src="${post.imagem}" alt="imagem do post">
                    </div>

                </div>
            `;

            container.appendChild(article);
        });

        if (botao) container.appendChild(botao);

    } catch (error) {
        console.error('Erro ao carregar preview do fórum:', error);
    }
}

carregarPreviewForum();

// ── Favoritos do usuário logado ──
async function carregarFavoritos() {
    const card = document.getElementById('favoritos-card');
    if (!card) return;

    const usuario = typeof getUsuario === 'function' ? getUsuario() : null;
    if (!usuario) {
        card.innerHTML = '<p style="padding:14px;color:#777;font-size:0.85rem;">Faça login para ver seus parques favoritos.</p>';
        return;
    }

    try {
        const [resFav, resParques] = await Promise.all([
            fetch('http://localhost:3000/api/favoritos?usuario_id=' + usuario.id),
            fetch('http://localhost:3000/api/parques')
        ]);
        const favoritos = await resFav.json();
        const parques = await resParques.json();
        const imagens = ['./assets/images/parque1.png', './assets/images/parque2.png', './assets/images/parque3.png'];

        if (!favoritos.length) {
            card.innerHTML = '<p style="padding:14px;color:#777;font-size:0.85rem;">Você ainda não favoritou nenhum parque. Visite a página de parques!</p>';
            return;
        }

        card.innerHTML = favoritos.map((f, i) => {
            const parque = parques.find(p => p.id === f.parque_id);
            if (!parque) return '';
            return `
              <div class="park-item favorite-item">
                <div class="park-left">
                  <img src="${imagemDoParque(parque)}" alt="${parque.nome}" onerror="this.onerror=null;this.src='${imagens[i % 3]}'">
                  <div><p>${parque.nome}</p></div>
                </div>
                <div class="favorite-right">
                  <i class="bi bi-heart-fill heart"></i>
                </div>
              </div>`;
        }).join('');
    } catch (e) {
        console.error('Erro ao carregar favoritos:', e);
    }
}

carregarFavoritos();

// ── Recomendações: 3 parques aleatórios ──
async function carregarRecomendacoes() {
    const card = document.getElementById('recomendacoes-card');
    if (!card) return;

    try {
        const [parques, avaliacoes] = await Promise.all([
            fetch('http://localhost:3000/api/parques').then(r => r.json()),
            fetch('http://localhost:3000/api/avaliacoes').then(r => r.json())
        ]);
        const imagens = ['./assets/images/parque1.png', './assets/images/parque2.png', './assets/images/parque3.png'];
        const sorteados = [...parques].sort(() => Math.random() - 0.5).slice(0, 3);

        card.innerHTML = sorteados.map((p, i) => {
            const notas = avaliacoes.filter(a => a.parque_id === p.id).map(a => a.nota);
            const media = notas.length ? Math.round(notas.reduce((a, b) => a + b, 0) / notas.length) : 0;
            const estrelas = [1, 2, 3, 4, 5]
                .map(n => `<i class="bi bi-star-fill ${n <= media ? 'active' : ''}"></i>`).join('');
            return `
              <div class="park-item">
                <div class="park-left">
                  <img src="${imagemDoParque(p)}" alt="${p.nome}" onerror="this.onerror=null;this.src='${imagens[i % 3]}'">
                  <div><p>${p.nome}</p></div>
                </div>
                <div class="park-right">
                  <div class="stars">${estrelas}</div>
                </div>
              </div>`;
        }).join('');
    } catch (e) {
        console.error('Erro ao carregar recomendações:', e);
    }
}

carregarRecomendacoes();

// ── Busca da home → leva para parques.html já filtrado ──
function buscarParques() {
    const params = new URLSearchParams();
    const busca = document.getElementById('buscaIndex');
    if (busca && busca.value.trim()) params.set('busca', busca.value.trim());

    document.querySelectorAll('#filter-panel .filter-group').forEach(g => {
        if (g.dataset.val) params.set(g.dataset.filtro, g.dataset.val);
    });

    const qs = params.toString();
    window.location.href = 'parques.html' + (qs ? '?' + qs : '');
}

function toggleFilters() {
    const panel = document.getElementById('filter-panel');
    panel.classList.toggle('filter-show');
}

function toggleDropdown(header) {
    const options = header.nextElementSibling;
    options.classList.toggle('dropdown-closed');
}

function selectOption(li) {
    const grupo = li.closest('.filter-group');
    const val = li.dataset.val || li.innerText.trim();

    // Distância depende do endereço cadastrado → exige login
    if (grupo.dataset.filtro === 'distancia' && typeof getUsuario === 'function' && !getUsuario()) {
        alert('Entre na sua conta para filtrar por distância — usamos o endereço do seu cadastro.');
        abrirModalLogin();
        return;
    }

    grupo.querySelector('.filter-header span').innerText = li.innerText.trim();
    grupo.dataset.val = val;
    grupo.querySelector('.filter-options').classList.add('dropdown-closed');
}

// Inicializa o mapa centralizado em BH
const map = L.map('map').setView([-19.9167, -43.9345], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
}).addTo(map);

function iconeMapa(cor) {
    return L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${cor}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });
}
const greenIcon = iconeMapa('green');
const redIcon = iconeMapa('red');

const marcadores = []; // { nomeLower, marker }

const query = `
    [out:json][timeout:25];
    area["name"="Belo Horizonte"]["boundary"="administrative"]->.bh;
    (
      node["leisure"="park"](area.bh);
      way["leisure"="park"](area.bh);
      relation["leisure"="park"](area.bh);
    );
    out center;
`;

fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
})
    .then(res => res.json())
    .then(data => {
        const vistos = new Set(); // evita pontos repetidos para o mesmo parque
        data.elements.forEach(el => {
            const lat = el.lat ?? el.center?.lat;
            const lon = el.lon ?? el.center?.lon;
            const nome = el.tags?.name;

            // Só parques (nome iniciando por "Parque"), sem praças nem repetidos
            if (!lat || !lon || !nome || !/^parque\b/i.test(nome.trim())) return;
            const chave = nome.trim().toLowerCase();
            if (vistos.has(chave)) return;
            vistos.add(chave);

            const marker = L.marker([lat, lon], { icon: greenIcon })
                .addTo(map)
                .bindPopup(`<strong>${nome}</strong>`);
            marcadores.push({ nomeLower: chave, marker });
        });
    })
    .catch(err => console.error('Erro ao buscar parques:', err));

// Destaca em vermelho no mapa os parques que batem com a busca (tempo real)
function destacarNoMapa(termo) {
    const t = (termo || '').trim().toLowerCase();
    let primeiro = null;
    marcadores.forEach(m => {
        const match = t && m.nomeLower.includes(t);
        m.marker.setIcon(match ? redIcon : greenIcon);
        if (match && !primeiro) primeiro = m.marker;
    });
    if (primeiro) { map.panTo(primeiro.getLatLng()); primeiro.openPopup(); }
}

const inputBuscaMapa = document.getElementById('buscaIndex');
if (inputBuscaMapa) {
    inputBuscaMapa.addEventListener('input', () => destacarNoMapa(inputBuscaMapa.value));
}