const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');

// --- ROTAS DO CLIENTE ---

// POST /api/pedidos/ -> Cria um novo pedido
router.post('/', authMiddleware, pedidoController.criarPedido);

// GET /api/pedidos/ -> Lista os pedidos do cliente logado
router.get('/', authMiddleware, pedidoController.listarMeusPedidos);

// POST /api/pedidos/:id_pedido/avaliar -> Avalia um pedido específico
router.post('/:id_pedido/avaliar', authMiddleware, pedidoController.avaliarPedido);

// PUT /api/pedidos/cancelar/:id_pedido -> Cancela um pedido
router.put('/cancelar/:id_pedido', authMiddleware, pedidoController.cancelarPedido);


// --- ROTAS DO RESTAURANTE ---

// GET /api/pedidos/restaurante -> Lista os pedidos recebidos pelo restaurante logado
router.get('/restaurante', authMiddleware, pedidoController.listarPedidosRestaurante);

// GET /api/pedidos/restaurante/contagem-novos -> Conta os pedidos não finalizados
router.get('/restaurante/contagem-novos', authMiddleware, pedidoController.contarPedidosNaoFinalizados);

// PATCH /api/pedidos/:id_pedido/status -> Atualiza o status de um pedido
router.patch('/:id_pedido/status', authMiddleware, pedidoController.atualizarStatusPedido);


module.exports = router;