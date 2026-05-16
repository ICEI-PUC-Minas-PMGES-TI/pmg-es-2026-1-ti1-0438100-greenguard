const modalPost = document.getElementById("modalPost"); 
const descricao = document.getElementById("descricao"); 
const catGroup = document.getElementById("catGroup");   
const parque = document.getElementById("parque");       

function enviar() {
  const texto = descricao.value.trim();       
  const parqueTexto = parque.value.trim();    

  const categoriaAtiva = catGroup.querySelector(".active");
  const categoriaTexto = categoriaAtiva ? categoriaAtiva.dataset.cat : "Sem categoria";

  if (texto !== "") {
    const novoPost = document.createElement("div");
    novoPost.classList.add("post");

    if (categoriaAtiva) {
      novoPost.classList.add(categoriaAtiva.classList[1]); 
    }

    novoPost.innerHTML = `
      <p><strong>Descrição:</strong> ${texto}</p>
      <p><strong>Categoria:</strong> ${categoriaTexto}</p>
      <p><strong>Parque:</strong> ${parqueTexto}</p>
    `;

    modalPost.appendChild(novoPost);

    descricao.value = "";
    parque.value = "";
  }
}
