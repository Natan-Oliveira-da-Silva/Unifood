// backend/database/seeder.js
const run = (db, sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve(this);
        });
    });
};

async function seed(db) {
    const { count } = await new Promise((resolve, reject) => {
        db.get("SELECT COUNT(*) as count FROM grupos", (err, row) => err ? reject(err) : resolve(row || { count: 0 }));
    });

    if (count > 0) {
        return console.log("Banco de dados já populado (seeded).");
    }

    console.log("Iniciando seeding do banco de dados...");
    try {
        await run(db, "BEGIN TRANSACTION;");

        // --- Bloco 1: Insere dados primários ---
        console.log("Inserindo grupos...");
        await run(db, "INSERT INTO grupos (id_grupo, nome) VALUES (1, 'Cliente'), (2, 'Restaurante'), (3, 'AdminSistema');");
        
        console.log("Inserindo permissões...");
        // ✅ Usando sua lista de permissões
        await run(db, "INSERT INTO permissoes (id_permissao, nome) VALUES (1, 'VISUALIZAR_CARDAPIOS'), (2, 'FAZER_PEDIDOS'), (3, 'GERENCIAR_PERFIL_CLIENTE'), (4, 'GERENCIAR_RESTAURANTE'), (5, 'VISUALIZAR_PEDIDOS_RESTAURANTE'), (6, 'ADMINISTRAR_USUARIOS'), (7, 'ADMINISTRAR_RESTAURANTES_TODOS');");

        // --- Bloco 2: Insere as associações ---
        console.log("Inserindo associações grupo-permissão...");
        const associacoes = [
            { id_grupo: 1, id_permissao: 1 }, { id_grupo: 1, id_permissao: 2 }, { id_grupo: 1, id_permissao: 3 },
            { id_grupo: 2, id_permissao: 1 }, { id_grupo: 2, id_permissao: 4 }, { id_grupo: 2, id_permissao: 5 },
            { id_grupo: 3, id_permissao: 1 }, { id_grupo: 3, id_permissao: 2 }, { id_grupo: 3, id_permissao: 3 },
            { id_grupo: 3, id_permissao: 4 }, { id_grupo: 3, id_permissao: 5 }, { id_grupo: 3, id_permissao: 6 },
            { id_grupo: 3, id_permissao: 7 }
        ];
        
        const stmt = db.prepare("INSERT INTO grupo_permissao (id_grupo, id_permissao) VALUES (?, ?)");
        for (const assoc of associacoes) {
            await run(db, "INSERT INTO grupo_permissao (id_grupo, id_permissao) VALUES (?, ?)", [assoc.id_grupo, assoc.id_permissao]);
        }
        stmt.finalize();
        
        await run(db, "COMMIT;");
        console.log("Seeding concluído com sucesso.");

    } catch (error) {
        await run(db, "ROLLBACK;");
        console.error("Ocorreu um erro grave durante o seeding:", error);
    }
}

module.exports = { seed };