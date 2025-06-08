// backend/middleware/multer.config.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Função para garantir que o diretório de upload exista
const ensureDirExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Configuração de armazenamento para logos de restaurantes
const restauranteStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/restaurantes/';
        ensureDirExists(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Cria um nome de arquivo único para evitar conflitos
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro para aceitar apenas imagens
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo inválido. Apenas imagens são permitidas.'), false);
    }
};

const uploadRestaurante = multer({ storage: restauranteStorage, fileFilter: imageFileFilter });

module.exports = { uploadRestaurante };