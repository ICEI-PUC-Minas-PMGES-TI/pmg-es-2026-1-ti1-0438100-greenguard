const postsContainer = document.querySelector('.posts');

let postsData = [];
let parquesData = [];
let usuariosMap = {}; // id → usuario

let filtroAtivo = {
    texto: '',
    categoria: '',
    dataInicio: '',
    dataFim: ''
};

function limparLikesOrfaos() {
    const todosIds = postsData.map(p => p.id);
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('like-')) {
            const id = Number(key.replace('like-', ''));
            if (!todosIds.includes(id)) {
                localStorage.removeItem(key);
            }
        }
    });
}

async function carregarPosts() {
    try {
        const [resPosts, resUsuarios] = await Promise.all([
            fetch('http://localhost:3000/api/posts'),
            fetch('http://localhost:3000/api/usuarios')
        ]);

        postsData = await resPosts.json();
        const usuarios = await resUsuarios.json();
        usuariosMap = Object.fromEntries(usuarios.map(u => [u.id, u]));

        limparLikesOrfaos();
        renderizarPosts();
        renderizarRanking();
    } catch (error) {
        console.error('Erro ao carregar posts:', error);
    }
}

function renderizarPosts() {
    postsContainer.innerHTML = '';

    let dados = postsData;

    if (filtroAtivo.categoria) {
        dados = dados.filter(p => p.categoria === filtroAtivo.categoria);
    }

    if (filtroAtivo.texto) {
        const termo = filtroAtivo.texto.toLowerCase();
        dados = dados.filter(p =>
            p.titulo.toLowerCase().includes(termo) ||
            p.descricao.toLowerCase().includes(termo) ||
            p.autor.toLowerCase().includes(termo)
        );
    }

    if (filtroAtivo.dataInicio) {
        const inicio = new Date(filtroAtivo.dataInicio + 'T00:00:00');
        dados = dados.filter(p => new Date(p.data) >= inicio);
    }

    if (filtroAtivo.dataFim) {
        const fim = new Date(filtroAtivo.dataFim + 'T23:59:59');
        dados = dados.filter(p => new Date(p.data) <= fim);
    }

    dados.forEach(post => {

        const article = document.createElement('article');
        article.className = 'post-card';

        const postCurtido = localStorage.getItem(`like-${post.id}`);

        article.innerHTML = `
            <div class="post-content">

                <h1 class="post-title">${post.titulo}</h1>

                <div class="post-author">

                    <img
                        class="author-avatar"
                        src="${(usuariosMap[post.autor_id] && usuariosMap[post.autor_id].foto_perfil) || './assets/images/user-imagem.png'}"
                        onerror="this.src='./assets/images/user-imagem.png'"
                        alt="autor"
                    >

                    <h2 class="author-name">
                        ${post.autor}
                    </h2>

                </div>

                <p class="post-description">
                    ${post.descricao}
                </p>

            </div>

            <div 
                class="post-image"
                style="background-image: url('${post.imagem}');">
            </div>

            <div class="category-likes">

                <div class="title-category">

                    <div class="bolinha"></div>

                    <p class="post-category">
                        ${post.categoria}
                    </p>

                </div>

                <div class="likes">

                    <i 
                        class="bi ${postCurtido ? 'bi-heart-fill' : 'bi-heart'}"
                        style="
                            font-size:30px;
                            cursor:pointer;
                            color:${postCurtido ? 'red' : 'white'};
                        "
                        data-id="${post.id}">
                    </i>

                    <p class="like-count">
                        ${post.likes}
                    </p>

                </div>

            </div>
        `;

        postsContainer.appendChild(article);
    });

    ativarLikes();
}

function ativarLikes() {
    const botoesLike = document.querySelectorAll('.likes i');

    botoesLike.forEach(botao => {
        botao.addEventListener('click', () => {

            const postId = Number(botao.dataset.id);
            const post = postsData.find(p => p.id === postId);
            if (!post) return;

            const jaCurtiu = localStorage.getItem(`like-${postId}`);

            if (jaCurtiu) {
                post.likes--;
                localStorage.removeItem(`like-${postId}`);
            } else {
                post.likes++;
                localStorage.setItem(`like-${postId}`, 'true');
                if (typeof registrarAcao === 'function') registrarAcao('curtida');
            }

            fetch(`http://localhost:3000/api/posts/${postId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ likes: post.likes })
            });

            renderizarPosts();
        });
    });
}

async function renderizarRanking() {
    try {
        const response = await fetch('http://localhost:3000/api/usuarios');
        const usuarios = await response.json();

        const ranking = document.getElementById('rankingLista');
        if (!ranking) return;

        const ordenados = [...usuarios].sort((a, b) => b.xp - a.xp);

        ranking.innerHTML = '';

        ordenados.forEach((usuario, index) => {
            const li = document.createElement('li');
            li.className = 'ranking-item';

            li.innerHTML = `
                <span class="ranking-pos">${index + 1}°</span>
                <img class="ranking-avatar" src="${usuario.foto_perfil}" alt="${usuario.nome}" onerror="this.src='./assets/images/user-imagem.png'">
                <span class="ranking-nome">${usuario.nome}</span>
                <span class="ranking-xp">${usuario.xp}<span class="ranking-pts">pts</span></span>
            `;

            ranking.appendChild(li);
        });

    } catch (error) {
        console.error('Erro ao carregar ranking:', error);
    }
}

async function carregarParquesNoModal() {
    try {
        if (parquesData.length === 0) {
            const response = await fetch('http://localhost:3000/api/parques');
            parquesData = await response.json();
        }

        renderizarOpcoesParque('');

    } catch (error) {
        console.error('Erro ao carregar parques:', error);
    }
}

function renderizarOpcoesParque(termo) {
    const lista = document.getElementById('parqueLista');
    if (!lista) return;

    const filtrados = parquesData.filter(p =>
        p.nome.toLowerCase().includes(termo.toLowerCase())
    );

    lista.innerHTML = '';

    filtrados.forEach(parque => {
        const li = document.createElement('li');
        li.className = 'parque-opcao';
        li.textContent = parque.nome;

        li.addEventListener('click', () => {
            document.getElementById('parqueInput').value = parque.nome;
            document.getElementById('parqueValor').value = parque.nome;
            lista.innerHTML = '';
            lista.style.display = 'none';
        });

        lista.appendChild(li);
    });

    lista.style.display = filtrados.length > 0 ? 'block' : 'none';
}

carregarPosts();

const inputBusca = document.getElementById('inputBusca');

if (inputBusca) {
    inputBusca.addEventListener('input', () => {
        filtroAtivo.texto = inputBusca.value;
        renderizarPosts();
    });
}

const inputDataInicio = document.getElementById('dataInicio');
const inputDataFim = document.getElementById('dataFim');

if (inputDataInicio) {
    inputDataInicio.addEventListener('change', () => {
        filtroAtivo.dataInicio = inputDataInicio.value;
        renderizarPosts();
    });
}

if (inputDataFim) {
    inputDataFim.addEventListener('change', () => {
        filtroAtivo.dataFim = inputDataFim.value;
        renderizarPosts();
    });
}

// MODAL

const modal = document.getElementById('modalPost');
const abrirModal = document.getElementById('abrirModal');

if (abrirModal && modal) {

    abrirModal.addEventListener('click', () => {
        if (!getUsuario()) {
            abrirModalLogin();
            return;
        }
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        carregarParquesNoModal();
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

}

const parqueInput = document.getElementById('parqueInput');

if (parqueInput) {
    parqueInput.addEventListener('input', () => {
        document.getElementById('parqueValor').value = '';
        renderizarOpcoesParque(parqueInput.value);
    });

    parqueInput.addEventListener('focus', () => {
        renderizarOpcoesParque(parqueInput.value);
    });

    document.addEventListener('click', (e) => {
        const lista = document.getElementById('parqueLista');
        if (lista && !parqueInput.contains(e.target) && !lista.contains(e.target)) {
            lista.style.display = 'none';
        }
    });
}

const descricaoTextarea = document.getElementById('descricao');
const descContador = document.getElementById('desc-contador');
if (descricaoTextarea && descContador) {
    descricaoTextarea.addEventListener('input', () => {
        const len = descricaoTextarea.value.length;
        descContador.textContent = `${len} / 300`;
        descContador.style.color = len >= 280 ? '#e53935' : '#888';
    });
}

const photoInput = document.getElementById('photoInput');
const photoBox = document.querySelector('.photo-box');

if (photoInput && photoBox) {
    photoInput.addEventListener('change', () => {
        const file = photoInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            photoBox.style.backgroundImage = `url('${e.target.result}')`;
            photoBox.style.backgroundSize = 'cover';
            photoBox.style.backgroundPosition = 'center';
            photoBox.querySelector('.plus-icon').style.display = 'none';
        };
        reader.readAsDataURL(file);
    });
}

const sendBtn = document.querySelector('.send-btn');

if (sendBtn) {
    sendBtn.addEventListener('click', async () => {

        const descricao = document.getElementById('descricao').value.trim();
        const parque = document.getElementById('parqueValor').value.trim();
        const catAtiva = document.querySelector('#catGroup .cat-btn.active');
        const categoria = catAtiva ? catAtiva.dataset.cat : 'Assalto';

        if (!descricao || !parque) {
            alert('Preencha a descrição e selecione um parque antes de enviar.');
            return;
        }

        let imagemCaminho = './assets/images/user-imagem.png';

        if (photoInput.files[0]) {
            const formData = new FormData();
            formData.append('imagem', photoInput.files[0]);

            const uploadRes = await fetch('http://localhost:3000/upload', {
                method: 'POST',
                body: formData
            });

            const uploadData = await uploadRes.json();
            imagemCaminho = uploadData.caminho;
        }

        const usuario = getUsuario();
        const autor = usuario ? usuario.nome : 'Anônimo';
        const autor_id = usuario ? usuario.id : null;

        const novoPost = {
            autor_id: autor_id,
            autor: autor,
            titulo: parque,
            categoria: categoria,
            descricao: descricao,
            data: new Date().toISOString(),
            likes: 0,
            imagem: imagemCaminho
        };

        try {
            await fetch('http://localhost:3000/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoPost)
            });

            if (typeof registrarAcao === 'function') {
                registrarAcao('post');
                if (photoInput.files[0]) registrarAcao('foto');
            }

            document.getElementById('descricao').value = '';
            document.getElementById('parqueInput').value = '';
            document.getElementById('parqueValor').value = '';
            photoInput.value = '';
            photoBox.style.backgroundImage = '';
            photoBox.querySelector('.plus-icon').style.display = '';

            modal.classList.remove('active');
            document.body.style.overflow = '';

            await carregarPosts();

        } catch (error) {
            console.error('Erro ao cadastrar post:', error);
            alert('Erro ao enviar o post. Verifique se o servidor está rodando.');
        }

    });
}

// CATEGORIAS

const botoesCategoria = document.querySelectorAll('.cat-btn');

botoesCategoria.forEach(botao => {
    botao.addEventListener('click', () => {
        botoesCategoria.forEach(btn => btn.classList.remove('active'));
        botao.classList.add('active');
    });
});

// FILTROS

function toggleFilters() {
    const panel = document.getElementById('filter-panel');
    panel.classList.toggle('filter-show');

    const dropdownAssunto = panel.querySelector('.filter-group:last-child .filter-options');
    if (panel.classList.contains('filter-show')) {
        dropdownAssunto.classList.remove('dropdown-closed');
    } else {
        dropdownAssunto.classList.add('dropdown-closed');
    }
}

function limparFiltros() {
    filtroAtivo.texto = '';
    filtroAtivo.categoria = '';
    filtroAtivo.dataInicio = '';
    filtroAtivo.dataFim = '';

    const inputBusca = document.getElementById('inputBusca');
    if (inputBusca) inputBusca.value = '';

    const dataInicio = document.getElementById('dataInicio');
    if (dataInicio) dataInicio.value = '';

    const dataFim = document.getElementById('dataFim');
    if (dataFim) dataFim.value = '';

    const headerAssunto = document.querySelector('#filter-panel .filter-group:last-child .filter-header span');
    if (headerAssunto) headerAssunto.innerText = 'Assunto';

    renderizarPosts();
}

function toggleDropdown(header) {
    const options = header.nextElementSibling;
    options.classList.toggle('dropdown-closed');
}

function selectOption(li) {
    const valor = li.innerText.trim();
    const headerSpan = li.closest('.filter-group').querySelector('.filter-header span');

    headerSpan.innerText = valor;
    filtroAtivo.categoria = valor;

    renderizarPosts();
    toggleFilters();
}