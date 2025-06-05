
const express = require('express');
const router = express.Router();
const restauranteController = require('../controllers/restaurante.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');


router.get('/meu-restaurante', authMiddleware, restauranteController.getMeuRestaurante);


router.post('/', authMiddleware, restauranteController.criarRestaurante);


router.put('/meu-restaurante', authMiddleware, restauranteController.atualizarMeuRestaurante);

// TODO: Adicionar rota para DELETE (apagar) restaurante
// router.delete('/meu-restaurante', authMiddleware, restauranteController.apagarMeuRestaurante);

module.exports = router;