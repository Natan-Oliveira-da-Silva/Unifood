// backend/database/db.js

const sqlite3 = require('sqlite3').verbose();
const DBSOURCE = "./database/unifood.sqlite";

const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados SQLite:', err.message);
        throw err;
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        // Usamos db.serialize para garantir que os comandos SQL sejam executados em sequência
        db.serialize(() => {
            // Cria a tabela de clientes se ela não existir
            db.run(`
                CREATE TABLE IF NOT EXISTS clientes (
                    id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    senha TEXT NOT NULL,
                    telefone TEXT,
                    cep TEXT,
                    rua TEXT,
                    numero TEXT,
                    complemento TEXT,
                    bairro TEXT,
                    data_criacao TEXT DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) {
                    // Erro ao criar a tabela
                    console.error("Erro ao criar tabela clientes:", err.message);
                } else {
                    console.log("Tabela 'clientes' verificada/criada com sucesso.");
                    // Aqui poderíamos adicionar um log ou um seed inicial se necessário
                    // Exemplo: Inserir um cliente padrão para testes (cuidado em produção)
                    /*
                    const insert = 'INSERT OR IGNORE INTO clientes (nome, email, senha) VALUES (?,?,?)';
                    db.run(insert, ["Usuário Teste", "teste@unifood.com", "senha_hashed_teste"]);
                    */
                }
            });

            // Aqui adicionaremos a criação de outras tabelas no futuro
            // db.run(`CREATE TABLE IF NOT EXISTS outra_tabela (...)`, etc.);
        });
    }
});

module.exports = db;