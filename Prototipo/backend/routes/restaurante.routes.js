const express = require('express');
const router = express.Router();
const restauranteController = require('../controllers/restaurante.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');


// Usamos { uploadRestaurante } para pegar a configuração específica para restaurantes
const { uploadRestaurante } = require('../middleware/multer.config.js');

// Rota para buscar os dados do restaurante do usuário logado
router.get('/meu-restaurante', authMiddleware, restauranteController.getMeuRestaurante);

// Rota para CRIAR um novo restaurante 
router.post('/', authMiddleware, uploadRestaurante.single('imagemLogo'), restauranteController.criarRestaurante);

// Rota para ATUALIZAR o restaurante 
router.put('/meu-restaurante', authMiddleware, uploadRestaurante.single('imagemLogo'), restauranteController.atualizarMeuRestaurante);


router.delete('/meu-restaurante', authMiddleware, restauranteController.apagarMeuRestaurante);


module.exports = router;