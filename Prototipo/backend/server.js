const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database/db.js');
const multer = require('multer');

// Importar os arquivos de rota
const usuarioRoutes = require('./routes/usuario.routes.js');
const cozinhaRoutes = require('./routes/cozinha.routes.js');
const restauranteRoutes = require('./routes/restaurante.routes.js');
const produtoRoutes = require('./routes/produto.routes.js');

const app = express();
const port = process.env.PORT || 3001;

// Middlewares Globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Rotas da Aplicação ---
app.get('/api', (req, res) => {
  res.json({ message: 'Bem-vindo à API do UNIFOOD!' });
});

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/cozinhas', cozinhaRoutes);
app.use('/api/restaurantes', restauranteRoutes);
app.use('/api/produtos', produtoRoutes);

// --- Tratamento de Rotas Não Encontradas (404) ---
// Deve vir DEPOIS de todas as rotas da sua API
app.use((req, res, next) => {
  res.status(404).json({ message: "Desculpe, o endpoint solicitado não foi encontrado." });
});

// --- Tratamento de Erros Global ---
// Deve vir POR ÚLTIMO na cadeia de middlewares
app.use((err, req, res, next) => {
  console.error("Ocorreu um erro na aplicação:", err.stack);

  if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Erro no upload: ${err.message}`});
  }
  if (err.message.startsWith("Tipo de arquivo inválido")) {
       return res.status(400).json({ message: err.message });
  }

  res.status(500).json({
    message: "Ocorreu um erro interno no servidor. Por favor, tente novamente mais tarde.",
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor backend rodando na porta ${port}`);
});