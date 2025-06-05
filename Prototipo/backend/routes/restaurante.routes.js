
const express = require('express');
const router = express.Router();
const restauranteController = require('../controllers/restaurante.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js'); 


router.get('/meu-restaurante', authMiddleware, restauranteController.getMeuRestaurante);


router.post('/', authMiddleware, restauranteController.criarRestaurante);



module.exports = router;