// backend/routes/pedido.routes.js
const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');

// --- ROTAS DO CLIENTE ---

// Rota para um cliente CRIAR um novo pedido
router.post('/', authMiddleware, pedidoController.criarPedido);

// Rota para um cliente LISTAR seus próprios pedidos
router.get('/', authMiddleware, pedidoController.listarMeusPedidos);

// Rota para um cliente AVALIAR um pedido
router.post('/:id_pedido/avaliar', authMiddleware, pedidoController.avaliarPedido);


// --- ROTAS DO RESTAURANTE ---


router.get('/restaurante', authMiddleware, pedidoController.listarPedidosRestaurante);

// Rota para o restaurante obter a CONTAGEM de novos pedidos
router.get('/restaurante/contagem-novos', authMiddleware, pedidoController.contarPedidosNaoFinalizados);


router.patch('/:id_pedido/status', authMiddleware, pedidoController.atualizarStatusPedido);


module.exports = router;