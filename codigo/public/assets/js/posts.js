const postsContainer = document.querySelector('.posts');

let postsData = [];

async function carregarPosts() {
    try {
        const response = await fetch('http://localhost:3000/posts');
        const data = await response.json();

        postsData = data;

        renderizarPosts();

    } catch (error) {
        console.error('Erro ao carregar posts:', error);
    }
}

function renderizarPosts() {
    postsContainer.innerHTML = '';

    postsData.forEach(post => {

        const article = document.createElement('article');
        article.className = 'post-card';

        const postCurtido = localStorage.getItem(`like-${post.id}`);

        article.innerHTML = `
            <div class="post-content">

                <h1 class="post-title">${post.titulo}</h1>

                <div class="post-author">

                    <img 
                        class="author-avatar" 
                        src="./assets/images/user-imagem.png"
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

            const jaCurtiu = localStorage.getItem(`like-${postId}`);

            if (!post || jaCurtiu) return;

            post.likes++;

            localStorage.setItem(`like-${postId}`, 'true');

            renderizarPosts();
        });
    });
}

carregarPosts();

// ==========================
// MODAL
// ==========================

const modal = document.getElementById('modalPost');
const abrirModal = document.getElementById('abrirModal');

if (abrirModal && modal) {

    abrirModal.addEventListener('click', () => {

        modal.classList.add('active');

        // trava o scroll da página
        document.body.style.overflow = 'hidden';

    });

    modal.addEventListener('click', (event) => {

        // fecha ao clicar fora do card
        if (event.target === modal) {

            modal.classList.remove('active');

            // libera o scroll novamente
            document.body.style.overflow = '';

        }

    });

}

// ==========================
// CATEGORIAS
// ==========================

const botoesCategoria = document.querySelectorAll('.cat-btn');

botoesCategoria.forEach(botao => {

    botao.addEventListener('click', () => {

        botoesCategoria.forEach(btn => {
            btn.classList.remove('active');
        });

        botao.classList.add('active');

    });

});

// posts.js

/**
 * Envia um novo post/ocorrência de parque
 * @param {Object} dadosPost - Campos do modal de feedback
 * @param {string} dadosPost.descricao    - Descrição do fato ocorrido
 * @param {string} dadosPost.tipo         - Tipo do post: 'assalto' | 'reclamacao' | 'seguranca'
 * @param {string} dadosPost.parque       - Nome do parque onde ocorreu
 * @param {File|null} dadosPost.imagem    - Imagem anexada (opcional)
 * @returns {Promise<{ sucesso: boolean, mensagem: string, id?: string }>}
 */
async function enviarPost({ descricao, tipo, parque, imagem = null }) {
  // Validações básicas
  if (!descricao || descricao.trim() === '') {
    return { sucesso: false, mensagem: 'A descrição do fato é obrigatória.' };
  }
  if (!tipo) {
    return { sucesso: false, mensagem: 'Selecione o tipo do post (Assalto, Reclamação ou Segurança).' };
  }
  if (!parque || parque.trim() === '') {
    return { sucesso: false, mensagem: 'Informe o nome do parque.' };
  }

  try {
    const formData = new FormData();
    formData.append('descricao', descricao.trim());
    formData.append('tipo', tipo);           // 'assalto' | 'reclamacao' | 'seguranca'
    formData.append('parque', parque.trim());
    if (imagem) {
      formData.append('imagem', imagem);
    }

    const resposta = await fetch('/api/posts', {
      method: 'POST',
      body: formData,
      // NÃO setar Content-Type aqui — o browser define o boundary do multipart
    });

    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => ({}));
      return {
        sucesso: false,
        mensagem: erro.mensagem || `Erro ${resposta.status}: falha ao enviar o post.`,
      };
    }

    const dados = await resposta.json();
    return { sucesso: true, mensagem: 'Post enviado com sucesso!', id: dados.id };

  } catch (erro) {
    console.error('[enviarPost] Erro de rede:', erro);
    return { sucesso: false, mensagem: 'Erro de conexão. Tente novamente.' };
  }
}


// ─── Exemplo de uso junto ao botão "Enviar" do modal ────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const btnEnviar = document.querySelector('#modal-feedback .btn-enviar');
  if (!btnEnviar) return;

  btnEnviar.addEventListener('click', async () => {
    const descricao = document.querySelector('#input-descricao')?.value ?? '';
    const tipo      = document.querySelector('.btn-tipo.ativo')?.dataset.tipo ?? '';
    const parque    = document.querySelector('#input-parque')?.value ?? '';
    const arquivoEl = document.querySelector('#input-imagem');
    const imagem    = arquivoEl?.files[0] ?? null;

    const resultado = await enviarPost({ descricao, tipo, parque, imagem });

    if (resultado.sucesso) {
      alert(resultado.mensagem);
      fecharModal(); // sua função de fechar o modal
    } else {
      alert(resultado.mensagem);
    }
  });
});