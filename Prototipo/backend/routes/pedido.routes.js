const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');

// Rota para CRIAR um novo pedido (checkout)
router.post('/', authMiddleware, pedidoController.criarPedido);

// Rota para LISTAR os pedidos do usuário logado
router.get('/', authMiddleware, pedidoController.listarMeusPedidos);

module.exports = router;