function toggleFilters() {
    const panel = document.getElementById('filter-panel');
    panel.classList.toggle('filter-hidden');
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