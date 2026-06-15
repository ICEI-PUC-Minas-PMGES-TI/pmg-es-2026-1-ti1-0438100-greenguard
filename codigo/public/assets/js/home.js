async function carregarPreviewForum() {
    try {
        const response = await fetch('http://localhost:3000/api/posts');
        const posts = await response.json();

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
                                <img src="./assets/images/user-imagem.png" alt="${post.autor}">
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

function toggleFilters() {
    const panel = document.getElementById('filter-panel');
    panel.classList.toggle('filter-show');
}

function toggleDropdown(header) {
    const options = header.nextElementSibling;
    options.classList.toggle('dropdown-closed');
}

function selectOption(li) {
    const headerSpan = li.closest('.filter-group').querySelector('.filter-header span');
    headerSpan.innerText = li.innerText.trim();
}

// Inicializa o mapa
const map = L.map('map').setView([-19.865, -43.971], 14);

// Camada do mapa
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

// Marcador
L.marker([-19.865, -43.971])
    .addTo(map)
    .bindPopup('Parque Ecológico da Pampulha')
    .openPopup();