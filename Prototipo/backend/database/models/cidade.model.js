// backend/database/models/cidade.model.js
module.exports = (db) => {
    const sql = `
        CREATE TABLE IF NOT EXISTS cidades (
            id_cidade INTEGER PRIMARY KEY AUTOINCREMENT,
            id_estado INTEGER NOT NULL,
            nome TEXT NOT NULL,
            FOREIGN KEY (id_estado) REFERENCES estados (id_estado) ON DELETE CASCADE,
            UNIQUE (id_estado, nome)
        )
    `;
    db.run(sql, (err) => {
        if (err) {
            console.error("Erro ao criar tabela cidades:", err.message);
        } else {
            console.log("Tabela 'cidades' verificada/criada com sucesso.");
 
        }
    });
};