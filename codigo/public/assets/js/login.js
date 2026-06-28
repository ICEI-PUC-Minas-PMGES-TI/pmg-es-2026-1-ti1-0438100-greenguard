
const API = 'http://localhost:3000/api';

// ── Sessão (sessionStorage: limpa ao fechar o navegador) ──

function getUsuario() {
    const u = sessionStorage.getItem('gg_usuario');
    return u ? JSON.parse(u) : null;
}

function salvarSessao(usuario) {
    sessionStorage.setItem('gg_usuario', JSON.stringify(usuario));
}

function encerrarSessao() {
    sessionStorage.removeItem('gg_usuario');
}

// ── Header dinâmico ──

function renderizarHeader() {
    const usuario = getUsuario();
    const areaUsuario = document.getElementById('header-usuario');
    if (!areaUsuario) return;

    if (usuario) {
        areaUsuario.innerHTML = `
            <a href="perfil.html" style="display:flex;align-items:center;gap:0.5rem;text-decoration:none;color:inherit;">
                <figure style="margin:0;">
                    <img id="foto_perfil"
                         src="${usuario.foto_perfil || './assets/images/user-imagem.png'}"
                         alt="Perfil"
                         onerror="this.src='./assets/images/user-imagem.png'"
                         style="width:55px;height:55px;border-radius:50%;object-fit:cover;">
                </figure>
                <p style="margin:0;">Olá, <strong>${usuario.nome.split(' ')[0]}<br>${usuario.nome.split(' ')[1] || ''} !</strong></p>
            </a>
            <button onclick="logout()" id="btn-logout"
                style="background:#00CF53;color:white;border:none;border-radius:6px;
                       padding:6px 14px;font-family:'Poppins',sans-serif;font-size:13px;
                       cursor:pointer;margin-left:8px;">
                Sair
            </button>
        `;
    } else {
        areaUsuario.innerHTML = `
            <button onclick="abrirModalLogin()"
                style="background:#00CF53;color:white;border:none;border-radius:6px;
                       padding:10px 22px;font-family:'Poppins',sans-serif;font-size:15px;
                       font-weight:600;cursor:pointer;">
                Entrar
            </button>
        `;
    }
}

function logout() {
    encerrarSessao();
    renderizarHeader();
    const protegidas = ['perfil.html', 'pedro.html'];
    const paginaAtual = window.location.pathname.split('/').pop();
    if (protegidas.includes(paginaAtual)) {
        window.location.href = 'index.html';
    }
}

// ── Modal de login/cadastro ──

function criarModal() {
    if (document.getElementById('gg-modal-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'gg-modal-overlay';
    overlay.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,.45);
        z-index:99999;display:none;align-items:center;justify-content:center;
    `;

    overlay.innerHTML = `
        <div id="gg-modal-box" style="
            background:white;border-radius:16px;padding:36px 32px;
            width:100%;max-width:420px;font-family:'Poppins',sans-serif;
            position:relative;box-shadow:0 8px 32px rgba(0,0,0,.2);">

            <button onclick="fecharLoginModal()" style="
                position:absolute;top:14px;right:18px;background:none;border:none;
                font-size:22px;cursor:pointer;color:#888;">×</button>

            <div style="display:flex;margin-bottom:24px;border-bottom:2px solid #e0e0e0;">
                <button id="aba-login" onclick="trocarAbaLogin('login')" style="
                    flex:1;background:none;border:none;padding:10px;font-family:'Poppins',sans-serif;
                    font-size:15px;font-weight:600;cursor:pointer;color:#00CF53;
                    border-bottom:3px solid #00CF53;margin-bottom:-2px;">
                    Entrar
                </button>
                <button id="aba-cadastro" onclick="trocarAbaLogin('cadastro')" style="
                    flex:1;background:none;border:none;padding:10px;font-family:'Poppins',sans-serif;
                    font-size:15px;font-weight:600;cursor:pointer;color:#aaa;
                    border-bottom:3px solid transparent;margin-bottom:-2px;">
                    Cadastrar
                </button>
            </div>

            <div id="form-login">
                <h2 style="margin:0 0 20px;font-size:20px;color:#222;">Bem-vindo de volta!</h2>

                <label style="font-size:13px;font-weight:600;color:#555;">Login</label>
                <input id="inp-login" type="text" placeholder="Seu login"
                    style="${estiloInput()}">

                <label style="font-size:13px;font-weight:600;color:#555;margin-top:12px;display:block;">Senha</label>
                <input id="inp-senha" type="password" placeholder="Sua senha"
                    style="${estiloInput()}">

                <p id="msg-login" style="color:red;font-size:12px;margin:6px 0 0;min-height:16px;"></p>

                <button onclick="fazerLogin()" style="${estiloBtnPrimario()}">
                    Entrar
                </button>
            </div>

            <div id="form-cadastro" style="display:none;">
                <h2 style="margin:0 0 20px;font-size:20px;color:#222;">Criar conta</h2>

                <label style="font-size:13px;font-weight:600;color:#555;">Nome completo</label>
                <input id="cad-nome" type="text" placeholder="Seu nome"
                    style="${estiloInput()}">

                <label style="font-size:13px;font-weight:600;color:#555;margin-top:12px;display:block;">Login</label>
                <input id="cad-login" type="text" placeholder="Escolha um login"
                    style="${estiloInput()}">

                <label style="font-size:13px;font-weight:600;color:#555;margin-top:12px;display:block;">E-mail</label>
                <input id="cad-email" type="email" placeholder="seu@email.com"
                    style="${estiloInput()}">

                <label style="font-size:13px;font-weight:600;color:#555;margin-top:12px;display:block;">Senha</label>
                <input id="cad-senha" type="password" placeholder="Crie uma senha"
                    style="${estiloInput()}">

                <p id="msg-cadastro" style="color:red;font-size:12px;margin:6px 0 0;min-height:16px;"></p>

                <button onclick="fazerCadastro()" style="${estiloBtnPrimario()}">
                    Criar conta
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) fecharLoginModal();
    });
}

function estiloInput() {
    return `width:100%;height:44px;border:1.5px solid #ddd;border-radius:8px;
            padding:0 12px;font-family:'Poppins',sans-serif;font-size:14px;
            outline:none;box-sizing:border-box;margin-top:4px;display:block;`;
}

function estiloBtnPrimario() {
    return `width:100%;height:48px;background:#00CF53;color:white;border:none;
            border-radius:10px;font-family:'Poppins',sans-serif;font-size:15px;
            font-weight:600;cursor:pointer;margin-top:18px;`;
}

function abrirModalLogin() {
    criarModal();
    document.getElementById('gg-modal-overlay').style.display = 'flex';
    trocarAbaLogin('login');
}

function fecharLoginModal() {
    const overlay = document.getElementById('gg-modal-overlay');
    if (overlay) overlay.style.display = 'none';
}

function trocarAbaLogin(aba) {
    const formLogin = document.getElementById('form-login');
    const formCad = document.getElementById('form-cadastro');
    const abaLogin = document.getElementById('aba-login');
    const abaCad = document.getElementById('aba-cadastro');

    if (aba === 'login') {
        formLogin.style.display = 'block';
        formCad.style.display = 'none';
        abaLogin.style.color = '#00CF53';
        abaLogin.style.borderBottom = '3px solid #00CF53';
        abaCad.style.color = '#aaa';
        abaCad.style.borderBottom = '3px solid transparent';
    } else {
        formLogin.style.display = 'none';
        formCad.style.display = 'block';
        abaLogin.style.color = '#aaa';
        abaLogin.style.borderBottom = '3px solid transparent';
        abaCad.style.color = '#00CF53';
        abaCad.style.borderBottom = '3px solid #00CF53';
    }
}

// ── Login ──

async function fazerLogin() {
    const login = document.getElementById('inp-login').value.trim();
    const senha = document.getElementById('inp-senha').value.trim();
    const msg = document.getElementById('msg-login');

    if (!login || !senha) { msg.textContent = 'Preencha login e senha.'; return; }

    try {
        const res = await fetch(`${API}/usuarios`);
        const usuarios = await res.json();
        const encontrado = usuarios.find(u => u.login === login && u.senha === senha);

        if (!encontrado) { msg.textContent = 'Login ou senha incorretos.'; return; }

        salvarSessao(encontrado);
        fecharLoginModal();
        renderizarHeader();
    } catch {
        msg.textContent = 'Erro ao conectar com o servidor.';
    }
}

// ── Cadastro ──

async function fazerCadastro() {
    const nome = document.getElementById('cad-nome').value.trim();
    const login = document.getElementById('cad-login').value.trim();
    const email = document.getElementById('cad-email').value.trim();
    const senha = document.getElementById('cad-senha').value.trim();
    const msg = document.getElementById('msg-cadastro');

    if (!nome || !login || !email || !senha) { msg.textContent = 'Preencha todos os campos.'; return; }

    try {
        const res = await fetch(`${API}/usuarios`);
        const usuarios = await res.json();

        if (usuarios.find(u => u.login === login)) { msg.textContent = 'Este login já está em uso.'; return; }
        if (usuarios.find(u => u.email === email)) { msg.textContent = 'Este e-mail já está cadastrado.'; return; }

        const novoUsuario = {
            login, senha, nome, email,
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
        salvarSessao(criado);
        fecharLoginModal();
        renderizarHeader();

    } catch {
        msg.textContent = 'Erro ao conectar com o servidor.';
    }
}

// ── Init ──

document.addEventListener('DOMContentLoaded', () => {
    renderizarHeader();
});
