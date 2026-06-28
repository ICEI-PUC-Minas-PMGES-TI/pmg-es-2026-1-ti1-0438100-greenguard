const API = 'http://localhost:3000/api';

async function fazerLoginPagina() {
    const login = document.getElementById('campo-usuario').value.trim();
    const senha = document.getElementById('campo-senha').value.trim();
    const msg = document.getElementById('msg-login');

    if (!login || !senha) {
        msg.textContent = 'Preencha usuário e senha.';
        return;
    }

    try {
        const res = await fetch(`${API}/usuarios`);
        const usuarios = await res.json();
        const encontrado = usuarios.find(u => u.login === login && u.senha === senha);

        if (!encontrado) {
            msg.textContent = 'Login ou senha incorretos.';
            return;
        }

        sessionStorage.setItem('gg_usuario', JSON.stringify(encontrado));
        window.location.href = 'index.html';
    } catch {
        msg.textContent = 'Erro ao conectar com o servidor.';
    }
}
