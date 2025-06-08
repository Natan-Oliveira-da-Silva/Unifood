const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller.js');

// Rota para registrar um novo usuário (cliente ou restaurante)
router.post('/', usuarioController.registrar);

// Rota para fazer o login de um usuário
router.post('/login', usuarioController.login);

module.exports = router;