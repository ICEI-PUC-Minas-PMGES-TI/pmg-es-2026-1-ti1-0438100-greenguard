const express = require('express');
const jsonServer = require('json-server');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const router = jsonServer.router('./db/db.json');
const middlewares = jsonServer.defaults({ static: './public' });

// ── Diretórios de upload ──

const dirs = [
    path.join(__dirname, 'public/assets/images/posts_sent'),
    path.join(__dirname, 'public/assets/images/perfil'),
];
dirs.forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

// ── Storage para posts ──

const storagePosts = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dirs[0]),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `post_${Date.now()}${ext}`);
    }
});

// ── Storage para fotos de perfil ──

const storagePerfil = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dirs[1]),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `perfil_${Date.now()}${ext}`);
    }
});

const uploadPost   = multer({ storage: storagePosts });
const uploadPerfil = multer({ storage: storagePerfil });

app.use(middlewares);
app.use(express.json());

// ── Upload de imagem de post ──

app.post('/upload', uploadPost.single('imagem'), (req, res) => {
    if (!req.file) return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
    res.json({ caminho: `./assets/images/posts_sent/${req.file.filename}` });
});

// ── Upload de foto de perfil ──

app.post('/upload-perfil', uploadPerfil.single('foto'), (req, res) => {
    if (!req.file) return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
    res.json({ caminho: `./assets/images/perfil/${req.file.filename}` });
});

app.use('/api', router);

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
