const express = require('express');
const jsonServer = require('json-server');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const router = jsonServer.router('./db/db.json');
const middlewares = jsonServer.defaults({ static: './public' });

const uploadDir = path.join(__dirname, 'public/assets/images/posts_sent');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const nome = `post_${Date.now()}${ext}`;
        cb(null, nome);
    }
});

const upload = multer({ storage });

app.use(middlewares);
app.use(express.json());

app.post('/upload', upload.single('imagem'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
    }
    const caminho = `./assets/images/posts_sent/${req.file.filename}`;
    res.json({ caminho });
});

app.use('/api', router);

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});