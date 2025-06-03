// backend/server.js

const express = require('express');
const cors = require('cors'); // 1. Importe o pacote cors
const db = require('./database/db.js'); // Garante que a conexão com o BD seja inicializada
const app = express();
const port = process.env.PORT || 3001;

// Middlewares
// 2. Habilite o CORS para todas as origens ANTES de suas rotas
// Isso permitirá que seu frontend em localhost:5173 (ou outra porta) acesse a API
app.use(cors());

// Middleware para permitir que o Express interprete JSON no corpo das requisições
app.use(express.json());
// Middleware para interpretar dados de formulário URL-encoded (útil para outras formas de requisição)
app.use(express.urlencoded({ extended: true }));


// --- Rotas da Aplicação ---

// Uma rota de teste inicial (você pode manter ou modificar)
app.get('/api', (req, res) => {
  res.json({ message: 'Bem-vindo à API do UNIFOOD!' }); // Alterado para /api e resposta JSON
});

// 3. Importe suas rotas de usuários
// Certifique-se de que o caminho para o arquivo está correto
// e que o arquivo 'usuario.routes.js' existe na pasta 'routes'
const usuarioRoutes = require('./routes/usuario.routes.js');

// 4. Use as rotas de usuários com um prefixo (ex: /api/usuarios)
app.use('/api/usuarios', usuarioRoutes);

// (Adicione outras rotas aqui conforme necessário, ex: para restaurantes, produtos, etc.)
// const restauranteRoutes = require('./routes/restaurante.routes.js');
// app.use('/api/restaurantes', restauranteRoutes);


// --- Tratamento de Rotas Não Encontradas (404) ---
// Este middleware será executado se nenhuma rota anterior corresponder
app.use((req, res, next) => {
  res.status(404).json({ message: "Desculpe, o endpoint solicitado não foi encontrado." });
});


// --- Tratamento de Erros Global ---
// Este middleware captura erros que ocorrem em qualquer rota
// (É importante que ele tenha 4 argumentos: err, req, res, next)
app.use((err, req, res, next) => {
  console.error("Ocorreu um erro na aplicação:", err.stack); // Loga o stack trace do erro no console do servidor
  res.status(500).json({
    message: "Ocorreu um erro interno no servidor. Por favor, tente novamente mais tarde.",
    // Em ambiente de desenvolvimento, você pode querer enviar mais detalhes do erro:
    // error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});


// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor backend rodando na porta ${port}`);
  // Você pode adicionar um log para confirmar o caminho do banco de dados se desejar
  // console.log(`Banco de dados conectado em: ${db.filename}`); // Se 'db' exportar 'filename'
});