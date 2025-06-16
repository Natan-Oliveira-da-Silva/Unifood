const express = require('express');
const router = express.Router();
const cozinhaController = require('../controllers/cozinha.controller.js');

router.get('/', cozinhaController.listarCozinhas);

module.exports = router;