
const express = require('express');
const router = express.Router();
const restauranteController = require('../controllers/restaurante.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');
const upload = require('../middleware/multer.config.js');


router.get('/meu-restaurante', authMiddleware, restauranteController.getMeuRestaurante);


router.post('/', authMiddleware, upload.single('imagemLogo'), restauranteController.criarRestaurante);


router.put('/meu-restaurante', authMiddleware, upload.single('imagemLogo'), restauranteController.atualizarMeuRestaurante);


router.delete('/meu-restaurante', authMiddleware, restauranteController.apagarMeuRestaurante);

module.exports = router;