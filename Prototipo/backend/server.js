require('dotenv').config();

const express = require('express');
const cors = require('cors');
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

// Middlewares Globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (imagens de uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Montagem das Rotas da Aplicação ---
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/cozinhas', cozinhaRoutes);
app.use('/api/restaurantes', restauranteRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/pedidos', pedidoRoutes);

// --- Middlewares de Tratamento de Erro (devem vir por último) ---

// Tratamento de Rotas Não Encontradas (404)
app.use((req, res, next) => {
    res.status(404).json({ message: "Endpoint não encontrado." });
});

// Tratamento de Erros Global (500)
app.use((err, req, res, next) => {
    console.error("ERRO GLOBAL CAPTURADO:", err.stack);
    res.status(500).json({ message: "Ocorreu um erro interno inesperado no servidor." });
});


// --- INICIALIZAÇÃO DO SERVIDOR ---
try {
    // Garante que o DB e as tabelas estejam prontos ANTES de iniciar o servidor
    initDb(); 
    
    app.listen(port, () => {
        console.log(`Servidor backend rodando e ouvindo na porta ${port}`);
    });
} catch (error) {
    console.error("FALHA NA INICIALIZAÇÃO: Não foi possível iniciar o servidor.", error);
    process.exit(1); // Encerra a aplicação se o DB não puder ser iniciado
}