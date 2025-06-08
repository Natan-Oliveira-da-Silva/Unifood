// backend/routes/restaurante.routes.js

const express = require('express');
const router = express.Router();

// --- Importação dos Módulos Necessários ---

// Importa o controller que contém a lógica de negócio para os restaurantes.
const restauranteController = require('../controllers/restaurante.controller.js');

// Importa o middleware de autenticação para proteger as rotas.
const authMiddleware = require('../middleware/auth.middleware.js');

// Importa a configuração do Multer para lidar com upload de arquivos.
// O nome 'upload' é uma convenção, o seu pode ser diferente.
const upload = require('../middleware/upload.js');


// --- Definição das Rotas de Restaurante ---

/*
 * ==================================================================
 * ROTAS PROTEGIDAS (Exigem que o usuário esteja autenticado)
 * ==================================================================
 */

/**
 * @route   POST /api/restaurantes
 * @desc    Cria um novo restaurante para o usuário logado.
 * @access  Privado
 */
router.post(
  '/',
  authMiddleware,                 // 1. Garante que o usuário está logado.
  upload.single('imagemLogo'),    // 2. Processa o upload da imagem e os dados do formulário. (ESSA FOI A CORREÇÃO)
  restauranteController.criarRestaurante // 3. Executa a função do controller para criar no banco.
);

/**
 * @route   PUT /api/restaurantes/meu-restaurante
 * @desc    Atualiza os detalhes do restaurante do usuário logado.
 * @access  Privado
 */
router.put(
  '/meu-restaurante',
  authMiddleware,
  upload.single('imagemLogo'), // Também precisa do Multer, pois o usuário pode querer atualizar a imagem.
  restauranteController.atualizarRestaurante
);

/**
 * @route   GET /api/restaurantes/meu-restaurante
 * @desc    Busca os detalhes do restaurante pertencente ao usuário logado.
 * @access  Privado
 */
router.get(
  '/meu-restaurante',
  authMiddleware,
  restauranteController.buscarMeuRestaurante
);


/**
 * @route   DELETE /api/restaurantes/meu-restaurante
 * @desc    Apaga o restaurante do usuário logado.
 * @access  Privado
 */
// ✅ ADICIONE ESTA ROTA
router.delete(
    '/meu-restaurante',
    authMiddleware,
    restauranteController.apagarRestaurante
);

/**
 * @route   GET /api/restaurantes
 * @desc    Lista todos os restaurantes ativos.
 * @access  Público
 */
router.get('/', restauranteController.listarRestaurantes);

/**
 * @route   GET /api/restaurantes/:id
 * @desc    Busca um restaurante específico pelo seu ID.
 * @access  Público
 */
router.get('/:id', restauranteController.buscarRestaurantePorId);


// --- Exportação do Módulo ---
module.exports = router;