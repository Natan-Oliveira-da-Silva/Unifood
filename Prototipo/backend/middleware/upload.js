// backend/middleware/upload.js

const multer = require('multer');
const path = require('path');

// Configuração de armazenamento para os arquivos
const storage = multer.diskStorage({
  // Define a pasta de destino para os arquivos enviados
  destination: (req, file, cb) => {
    // O 'cb' é um callback (error, destination)
    cb(null, 'uploads/');
  },
  // Define o nome do arquivo para evitar nomes duplicados
  filename: (req, file, cb) => {
    // Gera um nome único: campo original + timestamp + extensão original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // O 'cb' é um callback (error, filename)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro para aceitar apenas arquivos de imagem
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif/;
  // Verifica a extensão do arquivo e o tipo MIME
  const mimetype = allowedFileTypes.test(file.mimetype);
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  // Rejeita o arquivo se não for uma imagem
  cb(new Error('Erro: O upload de arquivos suporta apenas os seguintes formatos: ' + allowedFileTypes));
};

// Cria a instância do multer com as configurações de storage e filtro de arquivo
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limita o tamanho do arquivo para 5MB
  fileFilter: fileFilter
});

// Exporta a instância configurada para ser usada nas rotas
module.exports = upload;