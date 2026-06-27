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

// =========================
// Modal Check-in
// =========================

const abrirModal = document.getElementById("btn-checkin");
const modalParque = document.getElementById("modalParque");
const fecharModal = document.getElementById("fecharModal");

const checkLocalizacao = document.getElementById("check-localizacao");
const campoEncontrada = document.getElementById("coordEncontrada");
const campoParque = document.getElementById("coordParque");
const erro = document.getElementById("erroLocalizacao");
const formulario = document.querySelector(".form-parque");
const btnEnviar = document.getElementById("btnEnviar");

let localizacaoValida = false;

abrirModal.addEventListener("click", () => {

    modalParque.style.display = "flex";

});

fecharModal.addEventListener("click", () => {

    modalParque.style.display = "none";

});

window.addEventListener("click", (event) => {

    if(event.target === modalParque){

        modalParque.style.display = "none";

    }

});

function calcularDistancia(lat1, lon1, lat2, lon2){

    const R = 6371000;

    const dLat = (lat2-lat1) * Math.PI/180;
    const dLon = (lon2-lon1) * Math.PI/180;

    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1*Math.PI/180) *
        Math.cos(lat2*Math.PI/180) *
        Math.sin(dLon/2) *
        Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a),Math.sqrt(1-a));

    return R*c;

}

checkLocalizacao.addEventListener("change",()=>{

    if(!checkLocalizacao.checked){

        localizacaoValida = false;

        btnEnviar.disabled = true;

        return;

    }

    navigator.geolocation.getCurrentPosition((pos)=>{

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        campoEncontrada.value =
            lat.toFixed(6)+", "+lng.toFixed(6);

        const parque = campoParque.value.split(",");

        const latParque = parseFloat(parque[0]);
        const lngParque = parseFloat(parque[1]);

        const distancia =
            calcularDistancia(lat,lng,latParque,lngParque);

        if(distancia <= 100){

            localizacaoValida = true;

            erro.style.display = "none";

            btnEnviar.disabled = false;

        }else{

            localizacaoValida = false;

            erro.style.display = "block";

            btnEnviar.disabled = true;

        }

    },()=>{

        alert("Não foi possível obter sua localização.");

        localizacaoValida = false;

        btnEnviar.disabled = true;

    });

});

formulario.addEventListener("submit",(e)=>{

    if(!localizacaoValida){

        e.preventDefault();

        erro.style.display = "block";

        alert("Você precisa estar no parque para fazer o check-in.");

        return;

    }

    alert("Check-in realizado com sucesso!");

});