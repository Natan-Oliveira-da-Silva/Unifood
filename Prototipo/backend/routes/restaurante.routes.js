const express = require('express');
const router = express.Router();
const restauranteController = require('../controllers/restaurante.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');
const upload = require('../middleware/upload.js');

/*
 * ==================================================================
 * ROTAS PROTEGIDAS (Exigem que o usuário esteja autenticado)
 * ==================================================================
 */

// CRIAR um novo restaurante
router.post('/', authMiddleware, upload.single('imagemLogo'), restauranteController.criarRestaurante);

// ATUALIZAR os detalhes do restaurante do usuário logado
router.put('/meu-restaurante', authMiddleware, upload.single('imagemLogo'), restauranteController.atualizarRestaurante);

// BUSCAR os detalhes do restaurante do usuário logado
router.get('/meu-restaurante', authMiddleware, restauranteController.buscarMeuRestaurante);

// ✅ ROTA DELETE ADICIONADA AQUI
// APAGAR o restaurante do usuário logado
router.delete('/meu-restaurante', authMiddleware, restauranteController.apagarMeuRestaurante);


// LISTAR todos os restaurantes ativos
router.get('/', restauranteController.listarRestaurantes);

// BUSCAR um restaurante específico pelo ID
router.get('/:id', restauranteController.buscarRestaurantePorId);


module.exports = router;