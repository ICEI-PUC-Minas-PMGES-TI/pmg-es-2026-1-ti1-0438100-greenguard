

const API = 'http://localhost:3000/api';

// SESSÃO 

function getUsuario() {
    const u = localStorage.getItem('gg_usuario');
    return u ? JSON.parse(u) : null;
}

function salvarSessao(usuario) {
    localStorage.setItem('gg_usuario', JSON.stringify(usuario));
}

function encerrarSessao() {
    localStorage.removeItem('gg_usuario');
}

// HEADER DINÂMICO

s
// Inicializa o mapa
const map = L.map('map').setView([-19.865, -43.971], 14);

    // Suporta tanto o div simples quanto o div com link (index)
    const areaUsuario = document.getElementById('header-usuario');
    if (!areaUsuario) return;

// Marcador
L.marker([-19.865, -43.971])
    .addTo(map)
    .bindPopup('Parque Ecológico da Pampulha')
    .openPopup();

