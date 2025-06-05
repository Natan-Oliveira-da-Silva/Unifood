// backend/routes/usuario.routes.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js'); // Use se precisar proteger alguma rota

// --- ROTAS DE AUTENTICAÇÃO E CADASTRO ---

// Cria um novo usuário (cliente ou restaurante)
router.post('/', usuarioController.criarUsuario);

// Faz o login de um usuário
router.post('/login', usuarioController.loginUsuario);

// --- ROTAS DE RECUPERAÇÃO DE SENHA ---

// Solicita o e-mail de recuperação
router.post('/esqueci-senha', usuarioController.esqueciSenha);
// Submete a nova senha com o token
router.post('/resetar-senha/:token', usuarioController.resetarSenha);

// --- ROTAS CRUD BÁSICAS DE USUÁRIO ---

// Lista todos os usuários (Exemplo de rota protegida - apenas admin poderia ver)
router.get('/', authMiddleware, usuarioController.listarUsuarios);

// Obtém um usuário específico pelo ID
router.get('/:id', authMiddleware, usuarioController.obterUsuarioPorId);

// Atualiza um usuário
router.put('/:id', authMiddleware, usuarioController.atualizarUsuario);

// Desativa (deleção lógica) um usuário
router.delete('/:id', authMiddleware, usuarioController.deletarUsuario);

module.exports = router;