// backend/database/models/usuario_grupo.model.js
module.exports = (db) => {
    const sql = `
        CREATE TABLE IF NOT EXISTS usuario_grupos (
            id_usuario INTEGER NOT NULL,
            id_grupo INTEGER NOT NULL,
            PRIMARY KEY (id_usuario, id_grupo),
            FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE,
            FOREIGN KEY (id_grupo) REFERENCES grupos (id_grupo) ON DELETE CASCADE
        )
    `;
    
    db.run(sql, (err) => {
        if (err) {
            console.error("Erro ao criar tabela usuario_grupos:", err.message);
        } else {
            console.log("Tabela 'usuario_grupos' verificada/criada com sucesso.");
        }
    });
};