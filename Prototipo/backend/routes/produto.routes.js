
const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produto.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');
const { uploadProduto } = require('../middleware/multer.config.js');

router.post('/', authMiddleware, uploadProduto.single('imagemProduto'), produtoController.criarProduto);


router.get('/meus-produtos', authMiddleware, produtoController.listarProdutosDoMeuRestaurante);



module.exports = router;