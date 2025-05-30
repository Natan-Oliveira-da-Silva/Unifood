module.exports = (db) => {
    const sql = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha TEXT NOT NULL,
            data_cadastro TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `;
    db.run(sql, (err) => {
        if (err) {
            console.error("Erro ao criar tabela usuarios:", err.message);
        } else {
            console.log("Tabela 'usuarios' verificada/criada com sucesso.");
        }
    });
};