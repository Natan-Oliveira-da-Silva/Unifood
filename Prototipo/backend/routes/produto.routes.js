const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produto.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');
// ✅ Importe sua configuração do multer
const upload = require('../middleware/upload.js');

// Rota PÚBLICA para listar os produtos de um restaurante específico pelo ID
router.get('/por-restaurante/:id', produtoController.listarProdutosDeUmRestaurante);

// Rota PRIVADA para o restaurante logado criar um novo produto
router.post(
    '/', 
    authMiddleware, // 1. Verifica se o usuário está logado
    // ✅ CORREÇÃO: Adiciona o middleware do multer para processar o formulário
    upload.single('imagem'), // O nome 'imagem' deve corresponder ao `name` do seu input no frontend
    produtoController.criarProduto // 3. Chama o controller
);

module.exports = router;