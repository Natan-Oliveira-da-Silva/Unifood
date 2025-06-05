const express = require('express');
const router = express.Router();
const restauranteController = require('../controllers/restaurante.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');
const { uploadRestaurante } = require('../middleware/multer.config.js');

// --- ROTAS PÚBLICAS ---

// Rota para listar todos os restaurantes ativos (para os clientes verem)
router.get('/', restauranteController.listarTodosRestaurantes);

// --- ROTAS PRIVADAS (Acessíveis apenas por usuários logados do restaurante) ---

// Rota para buscar os dados do restaurante do usuário logado
router.get('/meu-restaurante', authMiddleware, restauranteController.getMeuRestaurante);

// Rota para CRIAR um novo restaurante 
router.post('/', authMiddleware, uploadRestaurante.single('imagemLogo'), restauranteController.criarRestaurante);

// Rota para ATUALIZAR o restaurante 
router.put('/meu-restaurante', authMiddleware, uploadRestaurante.single('imagemLogo'), restauranteController.atualizarMeuRestaurante);

// Rota para DELETAR o restaurante
router.delete('/meu-restaurante', authMiddleware, restauranteController.apagarMeuRestaurante);

module.exports = router;