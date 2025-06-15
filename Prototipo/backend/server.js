require('dotenv').config();

const express = require('express');
const cors = require("cors");
const path = require('path');
const { initDb } = require('./database/db.js');

// Importar todos os arquivos de rota
const usuarioRoutes = require('./routes/usuario.routes.js');
const cozinhaRoutes = require('./routes/cozinha.routes.js');
const restauranteRoutes = require('./routes/restaurante.routes.js');
const produtoRoutes = require('./routes/produto.routes.js');
const pedidoRoutes = require('./routes/pedido.routes.js');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: "http://localhost:5173", // frontend
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Middlewares Globais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Servir arquivos estáticos (como imagens de uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Rotas da Aplicação
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/cozinhas', cozinhaRoutes);
app.use('/api/restaurantes', restauranteRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/pedidos', pedidoRoutes);

// ✅ Middleware 404 - Rota não encontrada
app.use((req, res, next) => {
    res.status(404).json({ message: "Endpoint não encontrado." });
});

// ✅ Middleware Global de Erro
app.use((err, req, res, next) => {
    console.error("ERRO GLOBAL CAPTURADO:", err.stack);
    res.status(500).json({ message: "Ocorreu um erro interno inesperado no servidor." });
});

// ✅ Inicialização do Servidor
try {
    initDb(); // Inicializa o banco de dados e garante que está pronto
    app.listen(port, () => {
        console.log(`Servidor backend rodando e ouvindo na porta ${port}`);
    });
} catch (error) {
    console.error("FALHA NA INICIALIZAÇÃO: Não foi possível iniciar o servidor.", error);
    process.exit(1); // Encerra o servidor caso o banco não inicie corretamente
}
