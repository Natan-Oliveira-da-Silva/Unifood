// backend/database/models/cozinha.model.js
module.exports = (db) => {
    const sql = `
        CREATE TABLE IF NOT EXISTS cozinhas (
            id_cozinha INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE -- Ex: "Italiana", "Brasileira", "Japonesa"
        )
    `;
    db.run(sql, (err) => {
        if (err) {
            console.error("Erro ao criar tabela cozinhas:", err.message);
        } else {
            console.log("Tabela 'cozinhas' verificada/criada com sucesso.");

        }
    });
};