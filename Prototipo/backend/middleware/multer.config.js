// backend/middleware/multer.config.js
const multer = require('multer');
const path = require('path');

// Configuração do armazenamento em disco
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Certifique-se de que a pasta 'uploads/restaurantes' existe
        cb(null, 'uploads/restaurantes/'); 
    },
    filename: function (req, file, cb) {
        // Cria um nome de arquivo único para evitar sobrescrever arquivos
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
});


const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // Aceita o arquivo
    } else {
        // Rejeita o arquivo e passa uma mensagem de erro
        cb(new Error("Tipo de arquivo inválido. Apenas imagens (jpeg, png, gif, webp) são permitidas."), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // Limite de 5MB para o tamanho do arquivo
    },
    fileFilter: fileFilter
});

module.exports = upload;