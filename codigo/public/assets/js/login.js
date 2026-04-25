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