
const express = require('express');
const cors = require('cors');
const db = require('./database/db.js');

// Importar os arquivos de rota
const usuarioRoutes = require('./routes/usuario.routes.js');
const cozinhaRoutes = require('./routes/cozinha.routes.js');
const restauranteRoutes = require('./routes/restaurante.routes.js'); 

const app = express();
const port = process.env.PORT || 3001;


app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));




// Rota de teste inicial
app.get('/api', (req, res) => {
  res.json({ message: 'Bem-vindo à API do UNIFOOD!' });
});


app.use('/api/usuarios', usuarioRoutes);


app.use('/api/cozinhas', cozinhaRoutes);


app.use('/api/restaurantes', restauranteRoutes);




app.use((req, res, next) => {
  res.status(404).json({ message: "Desculpe, o endpoint solicitado não foi encontrado." });
});



app.use((err, req, res, next) => {
  console.error("Ocorreu um erro na aplicação:", err.stack);
  res.status(500).json({
    message: "Ocorreu um erro interno no servidor. Por favor, tente novamente mais tarde.",

  });
});


// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor backend rodando na porta ${port}`);
  
});