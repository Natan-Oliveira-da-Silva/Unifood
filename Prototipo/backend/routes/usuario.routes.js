const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');


// Rota para registrar um novo usuário
router.post('/registrar', usuarioController.registrar);


// fazer login de um usuário
router.post('/login', usuarioController.login);

// Rota para buscar os dados do perfil
router.get('/meu-perfil', authMiddleware, usuarioController.buscarMeuPerfil);

// Rota para atualizar os dados do perfil
router.put('/meu-perfil', authMiddleware, usuarioController.atualizarMeuPerfil);


module.exports = router;