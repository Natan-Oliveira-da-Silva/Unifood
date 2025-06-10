const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');

// --- ROTAS PÚBLICAS ---

// Rota para registrar um novo usuário
router.post('/registrar', usuarioController.registrar);

// ✅ GARANTA QUE ESTA ROTA 'POST /login' EXISTA E ESTEJA CORRETA
// Rota para fazer login de um usuário
router.post('/login', usuarioController.login);


// --- ROTAS PRIVADAS ---

// Rota para buscar os dados do perfil do usuário logado
router.get('/meu-perfil', authMiddleware, usuarioController.buscarMeuPerfil);

// Rota para atualizar os dados do perfil do usuário logado
router.put('/meu-perfil', authMiddleware, usuarioController.atualizarMeuPerfil);


module.exports = router;