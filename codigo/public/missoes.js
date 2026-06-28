const todosMissoes = document.querySelectorAll('.missao-item');

todosMissoes.forEach(function(itemMissao) {
  const checkbox = itemMissao.querySelector('input[type="checkbox"]');
  const label    = itemMissao.querySelector('label');

  function atualizarEstiloMissao() {
    if (checkbox.checked) {
      label.style.textDecoration = 'line-through';
      label.style.opacity = '0.6';
    } else {
      label.style.textDecoration = 'none';
      label.style.opacity = '1';
    }
  }

  checkbox.addEventListener('change', atualizarEstiloMissao);
  atualizarEstiloMissao();
});