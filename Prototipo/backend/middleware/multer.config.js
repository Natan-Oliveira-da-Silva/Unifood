
const multer = require('multer');
const path = require('path');


const createStorage = (destination) => {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, destination);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const fileExtension = path.extname(file.originalname);
            cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
        }
    });
};

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Tipo de arquivo inválido. Apenas imagens (jpeg, png, gif, webp) são permitidas."), false);
    }
};

const limits = { fileSize: 1024 * 1024 * 5 }; // 5MB


module.exports = {
    uploadRestaurante: multer({
        storage: createStorage('uploads/restaurantes/'),
        limits: limits,
        fileFilter: fileFilter
    }),
    uploadProduto: multer({
        storage: createStorage('uploads/produtos/'),
        limits: limits,
        fileFilter: fileFilter
    })
};