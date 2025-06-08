const express = require('express');
const router = express.Router();
const cozinhaController = require('../controllers/cozinha.controller.js');

// Rota para listar todos os tipos de cozinha
router.get('/', cozinhaController.listarCozinhas);

module.exports = router;