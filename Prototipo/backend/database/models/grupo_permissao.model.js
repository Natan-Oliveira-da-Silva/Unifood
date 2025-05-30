module.exports = (db) => {
    const sql = `
        CREATE TABLE IF NOT EXISTS grupo_permissoes (
            id_grupo INTEGER NOT NULL,
            id_permissao INTEGER NOT NULL,
            PRIMARY KEY (id_grupo, id_permissao),
            FOREIGN KEY (id_grupo) REFERENCES grupos (id_grupo) ON DELETE CASCADE,
            FOREIGN KEY (id_permissao) REFERENCES permissoes (id_permissao) ON DELETE CASCADE
        )
    `;

    db.run(sql, (err) => {
        if (err) {
            console.error("Erro ao criar tabela grupo_permissoes:", err.message);
        } else {
            console.log("Tabela 'grupo_permissoes' verificada/criada com sucesso.");
        }
    });
};