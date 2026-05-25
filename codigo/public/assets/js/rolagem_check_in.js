//Seção de Rolagem Check-in

function toggleLike(btn) {
  btn.classList.toggle('liked');
  const icon = btn.querySelector('.heart-icon');
  if (btn.classList.contains('liked')) {
    icon.setAttribute('fill', 'currentColor');
  } else {
    icon.setAttribute('fill', 'none');
  }
}