const express = require('express');
const app = express();
const port = process.env.PORT || 3333; 

// Middleware para permitir que o Express interprete JSON no corpo das requisições
app.use(express.json());

// Uma rota de teste inicial
app.get('/', (req, res) => {
  res.send('Olá do backend UNIFOOD!');
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor backend rodando na porta ${port}`);
});