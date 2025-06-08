// backend/routes/produto.routes.js
const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produto.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');
const upload = require('../middleware/upload.js');

// --- ROTAS PRIVADAS (requerem autenticação de restaurante) ---

// LISTAR produtos do restaurante logado
router.get('/meus-produtos', authMiddleware, produtoController.listarMeusProdutos);

// CRIAR um novo produto
router.post('/', authMiddleware, upload.single('imagem'), produtoController.criarProduto);

// ATUALIZAR um produto específico pelo ID
router.put('/:id', authMiddleware, upload.single('imagem'), produtoController.atualizarProduto);

// APAGAR um produto específico pelo ID
router.delete('/:id', authMiddleware, produtoController.apagarProduto);


// --- ROTAS PÚBLICAS ---

// LISTAR produtos de um restaurante para um cliente ver
router.get('/por-restaurante/:id', produtoController.listarProdutosDeUmRestaurante);

module.exports = router;