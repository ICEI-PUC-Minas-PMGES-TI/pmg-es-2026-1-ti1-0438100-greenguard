const API = 'http://localhost:3000/api';

function toggleSenha() {
    var campo = document.getElementById('campo-senha');
    if (campo.type === 'password') {
        campo.type = 'text';
    } else {
        campo.type = 'password';
    }
}

async function fazerCadastro() {
    const nome = document.getElementById('campo-nome').value.trim();
    const login = document.getElementById('campo-user').value.trim();
    const email = document.getElementById('campo-email').value.trim();
    const cpf = document.getElementById('campo-cpf').value.trim();
    const endereco = document.getElementById('campo-endereco').value.trim();
    const senha = document.getElementById('campo-senha').value.trim();
    const msg = document.getElementById('msg-cadastro');

    if (!nome || !login || !email || !cpf || !endereco || !senha) {
        msg.textContent = 'Preencha todos os campos.';
        return;
    }

    try {
        const res = await fetch(`${API}/usuarios`);
        const usuarios = await res.json();

        if (usuarios.find(u => u.login === login)) {
            msg.textContent = 'Este login já está em uso.';
            return;
        }
        if (usuarios.find(u => u.email === email)) {
            msg.textContent = 'Este e-mail já está cadastrado.';
            return;
        }

        const novoUsuario = {
            login, senha, nome, email, cpf, endereco,
            foto_perfil: './assets/images/user-imagem.png',
            nivel: 1,
            xp: 0
        };

        const postRes = await fetch(`${API}/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoUsuario)
        });

        const criado = await postRes.json();
        sessionStorage.setItem('gg_usuario', JSON.stringify(criado));
        window.location.href = 'index.html';

    } catch {
        msg.textContent = 'Erro ao conectar com o servidor.';
    }
}
