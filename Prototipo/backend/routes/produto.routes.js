const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produto.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');
const upload = require('../middleware/upload.js');



// LISTAR produtos do restaurante
router.get('/meus-produtos', authMiddleware, produtoController.listarMeusProdutos);

// CRIAR um novo produto
router.post('/', authMiddleware, upload.single('imagem'), produtoController.criarProduto);

// ATUALIZAR um produto
router.put('/:id', authMiddleware, upload.single('imagem'), produtoController.atualizarProduto);

// APAGAR um produto
router.delete('/:id', authMiddleware, produtoController.apagarProduto);



// LISTAR produtos de um restaurante
router.get('/por-restaurante/:id', produtoController.listarProdutosDeUmRestaurante);



module.exports = router;