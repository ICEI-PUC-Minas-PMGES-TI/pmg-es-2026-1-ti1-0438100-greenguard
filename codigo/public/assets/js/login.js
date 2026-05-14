function toggleFilters() {
    const panel = document.getElementById('filter-panel');
    panel.classList.toggle('filter-show');
}

function selectOption(li) {
    // Pega o texto da opção clicada
    const valor = li.innerText;
    // Pega o cabeçalho desse grupo para atualizar o texto (opcional)
    const headerSpan = li.closest('.filter-group').querySelector('.filter-header span');
    
    headerSpan.innerText = valor;
    
    // Fecha o painel verde após selecionar
    toggleFilters();
}

const observer = new IntersectionObserver(entries => {
    entries.forEach(e => e.target.classList.toggle('visivel', e.isIntersecting));
});

document.querySelectorAll('.park-card').forEach(card => observer.observe(card));

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