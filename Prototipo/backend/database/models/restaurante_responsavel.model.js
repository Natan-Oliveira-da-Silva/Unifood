module.exports = (db) => {
    const sql = `
        CREATE TABLE IF NOT EXISTS restaurante_responsaveis (
            id_restaurante INTEGER NOT NULL,
            id_usuario INTEGER NOT NULL,
            data_designacao TEXT DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id_restaurante, id_usuario),
            FOREIGN KEY (id_restaurante) REFERENCES restaurantes (id_restaurante) ON DELETE CASCADE,
            FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE
        )
    `;
   

    db.run(sql, (err) => {
        if (err) {
            console.error("Erro ao criar tabela restaurante_responsaveis:", err.message);
        } else {
            console.log("Tabela 'restaurante_responsaveis' verificada/criada com sucesso.");
        }
    });
};