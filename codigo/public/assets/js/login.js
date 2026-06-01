function toggleFilters() {
    const panel = document.getElementById('filter-panel');
    panel.classList.toggle('filter-show');
}

function selectOption(li) {

    const valor = li.innerText;

    const headerSpan = li.closest('.filter-group').querySelector('.filter-header span');

    headerSpan.innerText = valor;

    toggleFilters();
}

const observer = new IntersectionObserver(entries => {
    entries.forEach(e => e.target.classList.toggle('visivel', e.isIntersecting));
});

document.querySelectorAll('.park-card').forEach(card => observer.observe(card));

/* ===== MAPA ===== */

if (typeof L !== "undefined") {

    const map = L.map('map').setView([-19.865, -43.971], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    L.marker([-19.865, -43.971])
        .addTo(map)
        .bindPopup('Parque Ecológico da Pampulha')
        .openPopup();
}

/* ===== MODAL ===== */

const abrir = document.getElementById("red_senha");
const modal = document.getElementById("modalSenha");
const fechar = document.querySelector(".close");

if (abrir && modal && fechar) {

    abrir.addEventListener("click", function(e){

        e.preventDefault();

        modal.style.display = "flex";

    });

    fechar.addEventListener("click", function(){

        modal.style.display = "none";

    });

    window.addEventListener("click", function(e){

        if(e.target === modal){

            modal.style.display = "none";

        }

    });

}

const abrirModal = document.getElementById("abrirModal");

const modalParque = document.getElementById("modalParque");

const fecharModal = document.getElementById("fecharModal");

abrirModal.addEventListener("click", function(){

    modalParque.style.display = "flex";

});

fecharModal.addEventListener("click", function(){

    modalParque.style.display = "none";

});

window.addEventListener("click", function(event){

    if(event.target === modalParque){

        modalParque.style.display = "none";

    }

});