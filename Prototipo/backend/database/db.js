const sqlite3 = require('sqlite3').verbose();
const path = require('path'); 


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



            console.log("Processo de inicialização de tabelas concluído (ou em andamento de forma assíncrona).");
        });
    }
});

module.exports = db;