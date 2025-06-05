// backend/routes/produto.routes.js
const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produto.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');
const { uploadProduto } = require('../middleware/multer.config.js');

// Rota para CRIAR um novo produto com upload de imagem
router.post('/', authMiddleware, uploadProduto.single('imagemProduto'), produtoController.criarProduto);

// Rota para LISTAR os produtos do restaurante do usuário logado ("Meus Produtos")
router.get('/meus-produtos', authMiddleware, produtoController.listarProdutosDoMeuRestaurante);

// Rota para ATUALIZAR um produto específico pelo seu ID
router.put('/:id', authMiddleware, uploadProduto.single('imagemProduto'), produtoController.atualizarProduto);

// Rota para DELETAR um produto específico pelo seu ID
router.delete('/:id', authMiddleware, produtoController.deletarProduto);

module.exports = router;