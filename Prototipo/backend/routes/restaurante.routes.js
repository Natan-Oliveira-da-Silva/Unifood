const express = require('express');
const router = express.Router();
const restauranteController = require('../controllers/restaurante.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');
const upload = require('../middleware/upload.js');


// CRIAR um novo restaurante
router.post('/', authMiddleware, upload.single('imagemLogo'), restauranteController.criarRestaurante);


router.put('/meu-restaurante', authMiddleware, upload.single('imagemLogo'), restauranteController.atualizarRestaurante);

router.get('/meu-restaurante', authMiddleware, restauranteController.buscarMeuRestaurante);

// APAGAR o restaurante
router.delete('/meu-restaurante', authMiddleware, restauranteController.apagarMeuRestaurante);


// LISTAR todos os restaurantes
router.get('/', restauranteController.listarRestaurantes);

// BUSCAR um restaurante
router.get('/:id', restauranteController.buscarRestaurantePorId);


module.exports = router;