const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');

// Rota PRIVADA para um cliente logado criar um novo pedido
router.post('/', authMiddleware, pedidoController.criarPedido);

// Rota PRIVADA para um cliente logado listar seus próprios pedidos
router.get('/meus-pedidos', authMiddleware, pedidoController.listarMeusPedidos);


module.exports = router;