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
          <img class="author-avatar" src="./assets/images/user-imagem.png" alt="autor">
          <h2 class="author-name">${post.autor}</h2>
        </div>
        <p class="post-description">${post.descricao}</p>
      </div>
      <div class="post-image" style="background-image: url('${post.imagem}');"></div>
      <div class="category-likes">
        <div class="title-category">
          <div class="bolinha"></div>
          <p class="post-category">${post.categoria}</p>
        </div>
        <div class="likes">
          <i class="bi ${postCurtido ? 'bi-heart-fill' : 'bi-heart'}"
             style="font-size:30px;cursor:pointer;color:${postCurtido ? 'red' : 'white'};"
             data-id="${post.id}"></i>
          <p class="like-count">${post.likes}</p>
        </div>
      </div>`;
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
