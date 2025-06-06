// backend/routes/restaurante.routes.js
const express = require('express');
const router = express.Router();
const restauranteController = require('../controllers/restaurante.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');
const { uploadRestaurante } = require('../middleware/multer.config.js');

// --- ROTAS PÚBLICAS (Acessíveis por todos) ---

// Rota para listar todos os restaurantes ativos para os clientes
router.get('/', restauranteController.listarTodosRestaurantes);

// Rota para buscar os produtos de um restaurante específico pelo ID
router.get('/:id/produtos', restauranteController.listarProdutosDeUmRestaurante);


// --- ROTAS PRIVADAS (Acessíveis apenas por usuários de restaurante logados) ---

// Rota para buscar os dados do restaurante do usuário logado ("Meu Restaurante")
router.get('/meu-restaurante', authMiddleware, restauranteController.getMeuRestaurante);

// Rota para CRIAR um novo restaurante (com upload de logo)
router.post('/', authMiddleware, uploadRestaurante.single('imagemLogo'), restauranteController.criarRestaurante);

// Rota para ATUALIZAR os dados do restaurante do usuário logado
router.put('/meu-restaurante', authMiddleware, uploadRestaurante.single('imagemLogo'), restauranteController.atualizarMeuRestaurante);

// Rota para DELETAR o restaurante do usuário logado
router.delete('/meu-restaurante', authMiddleware, restauranteController.apagarMeuRestaurante);


module.exports = router;