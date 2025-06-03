// backend/routes/usuario.routes.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller.js'); 


router.post('/', usuarioController.criarUsuario);


router.get('/', usuarioController.listarUsuarios);


router.get('/:id', usuarioController.obterUsuarioPorId);


router.put('/:id', usuarioController.atualizarUsuario);


router.delete('/:id', usuarioController.deletarUsuario);

router.post('/login', usuarioController.loginUsuario)

module.exports = router;