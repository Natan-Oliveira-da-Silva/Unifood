const sqlite3 = require('sqlite3').verbose();
const path = require('path'); 
const criarTabelaUsuarioGrupos = require('./models/usuario_grupo.model.js');
const criarTabelaGrupoPermissoes = require('./models/grupo_permissao.model.js');
const criarTabelaCozinhas = require('./models/cozinha.model.js');
const criarTabelaRestaurantes = require('./models/restaurante.model.js');
const criarTabelaFormasPagamento = require('./models/forma_pagamento.model.js');
const  criarTabelaRestauranteFormasPagamento = require('./models/restaurante_forma_pagamento.model.js');
const  criarTabelaProdutos = require('./models/produto.model.js');


const DBSOURCE = path.resolve(__dirname, "unifood.sqlite");


const criarTabelaUsuarios = require('./models/usuario.model.js');
const criarTabelaGrupos = require('./models/grupo.model.js');
const criarTabelaPermissoes = require('./models/permissao.model.js');

const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados SQLite:', err.message);
        console.error('Caminho do BD:', DBSOURCE);
        throw err;
    } else {
        console.log(`Conectado ao banco de dados SQLite em ${DBSOURCE}`);
        db.serialize(() => {
            console.log("Inicializando criação/verificação das tabelas...");

     
            criarTabelaUsuarios(db);
            criarTabelaGrupos(db);
            criarTabelaPermissoes(db);
            criarTabelaUsuarioGrupos(db);
            criarTabelaGrupoPermissoes(db);
            criarTabelaCozinhas(db);
            criarTabelaRestaurantes(db);
            criarTabelaFormasPagamento(db);
            criarTabelaRestauranteFormasPagamento(db);
            criarTabelaProdutos(db);

            console.log("Processo de inicialização de tabelas concluído (ou em andamento de forma assíncrona).");
        });
    }
});

module.exports = db;