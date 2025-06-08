// backend/database/db.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DBSOURCE = path.join(__dirname, "unifood.sqlite");

const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error('ERRO FATAL: Não foi possível conectar ao banco de dados.', err.message);
        throw err;
    }
});

const initDb = () => {
    db.serialize(() => {
        console.log("Inicializando banco de dados e garantindo que todas as tabelas existam...");
        db.run("PRAGMA foreign_keys = ON;");

        // Carrega e cria cada tabela em sequência
        console.log("Carregando modelos...");
        require('./models/usuario.model.js')(db);
        require('./models/cozinha.model.js')(db);
        require('./models/estado.model.js')(db);
        require('./models/cidade.model.js')(db);
        require('./models/forma_pagamento.model.js')(db);
        require('./models/restaurante.model.js')(db);
        require('./models/produto.model.js')(db);
        require('./models/pedido.model.js')(db);
        require('./models/item_pedido.model.js')(db);

        // Adicionando os outros modelos da sua estrutura para garantir a criação
        require('./models/foto_produto.model.js')(db);
        require('./models/grupo.model.js')(db);
        require('./models/permissao.model.js')(db);
        require('./models/grupo_permissao.model.js')(db);
        require('./models/restaurante_forma_pagamento.model.js')(db);
        require('./models/usuario_grupo.model.js')(db);
        // O modelo 'restaurante_responsavel.model.js' pode não ser necessário
        // se a relação já está na tabela 'restaurantes', mas incluímos por segurança.
        require('./models/restaurante_responsavel.model.js')(db); 

        console.log("Banco de dados pronto para receber conexões.");
    });
};

module.exports = {
    db,
    initDb
};