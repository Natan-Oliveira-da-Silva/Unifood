module.exports = (db) => {
    const sqlCreateTable = `
        CREATE TABLE IF NOT EXISTS grupo_permissao (
            id_grupo INTEGER NOT NULL,
            id_permissao INTEGER NOT NULL,
            
            PRIMARY KEY (id_grupo, id_permissao),
            FOREIGN KEY (id_grupo) REFERENCES grupos(id_grupo) ON DELETE CASCADE,
            FOREIGN KEY (id_permissao) REFERENCES permissoes(id_permissao) ON DELETE CASCADE
        );
    `;

    db.run(sqlCreateTable, (err) => {
        if (err) {
            console.error("Erro ao criar tabela 'grupo_permissao':", err.message);
        } else {
            console.log("Tabela 'grupo_permissao' verificada/criada com sucesso.");
        }
    });
    
};