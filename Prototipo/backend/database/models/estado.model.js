// backend/database/models/estado.model.js
module.exports = (db) => {
    const sql = `
        CREATE TABLE IF NOT EXISTS estados (
            id_estado INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,      -- Nome completo do estado, ex: "São Paulo"
            uf TEXT NOT NULL UNIQUE  -- Sigla do estado, ex: "SP"
        )
    `;
    db.run(sql, (err) => {
        if (err) {
            console.error("Erro ao criar tabela estados:", err.message);
        } else {
            console.log("Tabela 'estados' verificada/criada com sucesso.");

        }
    });
};