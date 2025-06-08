const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produto.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');

// Rota PÚBLICA para listar os produtos de um restaurante específico pelo ID do restaurante
// Exemplo de como chamar: /api/produtos/por-restaurante/5
router.get('/por-restaurante/:id', produtoController.listarProdutosDeUmRestaurante);

// Rota PRIVADA para o restaurante logado criar um novo produto
// Você pode adicionar o middleware de upload de imagem aqui se desejar
router.post('/', authMiddleware, produtoController.criarProduto);

// (Futuramente, aqui entrariam as rotas PUT e DELETE para gerenciar produtos)

module.exports = router;