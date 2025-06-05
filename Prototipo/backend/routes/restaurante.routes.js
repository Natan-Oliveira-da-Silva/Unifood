
const express = require('express');
const router = express.Router();
const restauranteController = require('../controllers/restaurante.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');

// ... (suas rotas GET, POST, PUT) ...
router.get('/meu-restaurante', authMiddleware, restauranteController.getMeuRestaurante);
router.post('/', authMiddleware, restauranteController.criarRestaurante);
router.put('/meu-restaurante', authMiddleware, restauranteController.atualizarMeuRestaurante);

// Rota para APAGAR o restaurante do usuário logado
router.delete('/meu-restaurante', authMiddleware, restauranteController.apagarMeuRestaurante); // <<< VERIFIQUE ESTA LINHA

module.exports = router;