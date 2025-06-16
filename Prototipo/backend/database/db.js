const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { seed } = require('./seeder.js');

const DBSOURCE = path.join(__dirname, "unifood.sqlite");

const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error('ERRO FATAL: Não foi possível conectar ao banco de dados.', err.message);
        throw err;
    }
});

const initDb = () => {
    db.serialize(async () => {
        console.log("Inicializando banco de dados...");
        await new Promise((resolve, reject) => db.run("PRAGMA foreign_keys = ON;", (err) => err ? reject(err) : resolve()));
        
        console.log("Criando todas as tabelas...");
        require('./models/usuario.model.js')(db);
        require('./models/cozinha.model.js')(db);
        require('./models/estado.model.js')(db);
        require('./models/cidade.model.js')(db);
        require('./models/forma_pagamento.model.js')(db);
        require('./models/restaurante.model.js')(db);
        require('./models/produto.model.js')(db);
        require('./models/pedido.model.js')(db);
        require('./models/item_pedido.model.js')(db);
        require('./models/foto_produto.model.js')(db);
        require('./models/grupo.model.js')(db);
        require('./models/permissao.model.js')(db);
        require('./models/grupo_permissao.model.js')(db);
        require('./models/restaurante_forma_pagamento.model.js')(db);
        require('./models/usuario_grupo.model.js')(db);
        require('./models/restaurante_responsavel.model.js')(db); 
        console.log("Estrutura das tabelas verificada/criada.");

        db.run("SELECT 1", async () => {
             console.log("Tabelas prontas.");
             await seed(db);
             
        });
    });
};

module.exports = { db, initDb };