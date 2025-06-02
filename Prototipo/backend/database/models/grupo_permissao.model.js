// backend/database/models/grupo_permissao.model.js
module.exports = (db) => {
    const sqlCreateTable = `
        CREATE TABLE IF NOT EXISTS grupo_permissoes (
            id_grupo INTEGER NOT NULL,
            id_permissao INTEGER NOT NULL,
            data_atribuicao TEXT DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id_grupo, id_permissao),
            FOREIGN KEY (id_grupo) REFERENCES grupos (id_grupo) ON DELETE CASCADE,
            FOREIGN KEY (id_permissao) REFERENCES permissoes (id_permissao) ON DELETE CASCADE
        )
    `;

    db.run(sqlCreateTable, (err) => {
        if (err) {
            console.error("Erro ao criar tabela grupo_permissoes:", err.message);
        } else {
            console.log("Tabela 'grupo_permissoes' verificada/criada com sucesso.");

            // Assumindo IDs fixos devido à ordem de inserção em um banco limpo:
            // Grupos: 1=Cliente, 2=Restaurante, 3=AdminSistema
            // Permissões: 1=VISUALIZAR_CARDAPIOS, 2=FAZER_PEDIDOS, 3=GERENCIAR_PERFIL_CLIENTE,
            //             4=GERENCIAR_RESTAURANTE, 5=VISUALIZAR_PEDIDOS_RESTAURANTE,
            //             6=ADMINISTRAR_USUARIOS, 7=ADMINISTRAR_RESTAURANTES_TODOS

            const associacoes = [
                // Cliente
                { id_grupo: 1, id_permissao: 1 }, // Cliente -> VISUALIZAR_CARDAPIOS
                { id_grupo: 1, id_permissao: 2 }, // Cliente -> FAZER_PEDIDOS
                { id_grupo: 1, id_permissao: 3 }, // Cliente -> GERENCIAR_PERFIL_CLIENTE
                // Restaurante
                { id_grupo: 2, id_permissao: 1 }, // Restaurante -> VISUALIZAR_CARDAPIOS
                { id_grupo: 2, id_permissao: 4 }, // Restaurante -> GERENCIAR_RESTAURANTE
                { id_grupo: 2, id_permissao: 5 }, // Restaurante -> VISUALIZAR_PEDIDOS_RESTAURANTE
                
                // AdminSistema
                { id_grupo: 3, id_permissao: 6 }, // AdminSistema -> ADMINISTRAR_USUARIOS
                { id_grupo: 3, id_permissao: 7 }, // AdminSistema -> ADMINISTRAR_RESTAURANTES_TODOS
                { id_grupo: 3, id_permissao: 1 },
                { id_grupo: 3, id_permissao: 2 },
                { id_grupo: 3, id_permissao: 3 },
                { id_grupo: 3, id_permissao: 4 },
                { id_grupo: 3, id_permissao: 5 },
            ];

            const stmt = db.prepare("INSERT OR IGNORE INTO grupo_permissoes (id_grupo, id_permissao) VALUES (?, ?)");
            associacoes.forEach(assoc => {
                stmt.run(assoc.id_grupo, assoc.id_permissao, function(errInsert) {
                    if (errInsert) {
                        console.error(`Erro ao inserir associação grupo_permissao (${assoc.id_grupo}, ${assoc.id_permissao}):`, errInsert.message);
                    }
                });
            });
            stmt.finalize(errFinalize => {
                if (errFinalize) {
                    console.error("Erro ao finalizar statement de grupo_permissoes:", errFinalize.message);
                } else {
                    console.log("Associações padrão de grupo_permissoes processadas.");
                }
            });
        }
    });
};