const modalPost = document.getElementById("modalPost"); 
const descricao = document.getElementById("descricao"); 
const catGroup = document.getElementById("catGroup");   
const parque = document.getElementById("parque");       
const posts = document.querySelector(".posts");
const openBtn = document.querySelector(".botao");


openBtn.addEventListener("click", () => {
  modalPost.style.display = "flex";
});


window.addEventListener("click", (event) => {
  if (event.target === modalPost) {
    modalPost.style.display = "none";
  }
});


window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    modalPost.style.display = "none";
  }
});

const botoesCategoria = catGroup.querySelectorAll(".cat-btn");

botoesCategoria.forEach(botao => {
  botao.addEventListener("click", () => {


    botoesCategoria.forEach(b => b.classList.remove("active"));


    botao.classList.add("active");

  });
});

function enviar() {
  const texto = descricao.value.trim();       
  const parqueTexto = parque.value.trim();    
  const categoriaAtiva = catGroup.querySelector(".active");
  const categoriaTexto = categoriaAtiva ? categoriaAtiva.dataset.cat : "Sem categoria";

  if (texto !== "") {
    const novoPost = document.createElement("article");
    novoPost.className = "post-card";

    novoPost.innerHTML = `
      <div class="post-content">
        <h1 class="post-title">${texto}</h1>
        <div class="post-author">
          <img class="author-avatar" src="./assets/images/user-imagem.png" alt="autor">
          <h2 class="author-name">Você</h2>
        </div>
        <p class="post-description">Parque: ${parqueTexto}</p>
      </div>
      <div class="post-image"></div>
      <div class="category-likes">
        <div class="title-category">
          <div class="bolinha"></div>
          <p class="post-category">${categoriaTexto}</p>
        </div>
        <div class="likes">
          <i class="bi bi-heart" style="font-size:30px;cursor:pointer;color:white;"></i>
          <p class="like-count">0</p>
        </div>
      </div>
    `;

    posts.appendChild(novoPost);

    descricao.value = "";
    parque.value = "";
    modalPost.style.display = "none"; 
  }
}
