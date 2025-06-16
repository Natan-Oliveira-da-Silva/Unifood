const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');

// --- ROTAS DO CLIENTE ---

//  Cria um novo pedido
router.post('/', authMiddleware, pedidoController.criarPedido);

// Lista os pedidos do cliente logado
router.get('/', authMiddleware, pedidoController.listarMeusPedidos);

// Avalia um pedido específico
router.post('/:id_pedido/avaliar', authMiddleware, pedidoController.avaliarPedido);

// Cancela um pedido
router.put('/cancelar/:id_pedido', authMiddleware, pedidoController.cancelarPedido);


// --- ROTAS DO RESTAURANTE ---

//  Lista os pedidos recebidos pelo restaurante logado
router.get('/restaurante', authMiddleware, pedidoController.listarPedidosRestaurante);

// Conta os pedidos não finalizados
router.get('/restaurante/contagem-novos', authMiddleware, pedidoController.contarPedidosNaoFinalizados);

//  Atualiza o status de um pedido
router.patch('/:id_pedido/status', authMiddleware, pedidoController.atualizarStatusPedido);


module.exports = router;