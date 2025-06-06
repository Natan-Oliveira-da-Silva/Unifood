const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DBSOURCE = path.resolve(__dirname, "unifood.sqlite");

// Importa TODAS as funções de criação de tabela
const criarTabelaUsuarios = require('./models/usuario.model.js');
const criarTabelaCozinhas = require('./models/cozinha.model.js');
const criarTabelaEstados = require('./models/estado.model.js');
const criarTabelaCidades = require('./models/cidade.model.js');
const criarTabelaFormasPagamento = require('./models/forma_pagamento.model.js');
const criarTabelaRestaurantes = require('./models/restaurante.model.js');
const criarTabelaProdutos = require('./models/produto.model.js');
const criarTabelaPedidos = require('./models/pedido.model.js');
const criarTabelaItemPedido = require('./models/item_pedido.model.js');

const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados SQLite:', err.message);
        throw err;
    } else {
        console.log(`Conectado ao banco de dados SQLite em ${DBSOURCE}`);

        db.run("PRAGMA foreign_keys = ON;");

        db.serialize(() => {
            console.log("Inicializando criação/verificação das tabelas...");

            
            criarTabelaUsuarios(db);
            criarTabelaCozinhas(db);
            criarTabelaEstados(db);
            criarTabelaFormasPagamento(db);
            
            
            criarTabelaCidades(db); 
            criarTabelaRestaurantes(db); 
            
          
            criarTabelaProdutos(db);
            
            
            criarTabelaPedidos(db); 
            criarTabelaItemPedido(db); 

            console.log("Processo de inicialização de tabelas concluído.");
        });
    }
});

module.exports = db;