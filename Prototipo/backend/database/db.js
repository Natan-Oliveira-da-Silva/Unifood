const sqlite3 = require('sqlite3').verbose();

const DBSOURCE = "./database/unifood.sqlite";

// Conecta ao banco de dados SQLite
const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        // Não foi possível conectar ao banco
        console.error('Erro ao conectar ao banco de dados SQLite:', err.message);
        throw err; // Lança o erro para parar a aplicação se não conseguir conectar
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        
    }
});

module.exports = db;