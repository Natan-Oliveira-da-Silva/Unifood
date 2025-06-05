// backend/database/models/usuario.model.js
module.exports = (db) => {
    const sql = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
            nome_completo TEXT,
            email TEXT NOT NULL UNIQUE,
            senha_hash TEXT NOT NULL,
            telefone TEXT,
            cpf TEXT UNIQUE,
            tipo_usuario TEXT NOT NULL CHECK(tipo_usuario IN ('C', 'R')),
            data_cadastro TEXT DEFAULT CURRENT_TIMESTAMP,
            ativo INTEGER DEFAULT 1,
            reset_token TEXT,
            reset_token_expires TEXT -- <<< SEM VÍRGULA NO FINAL DA LISTA DE COLUNAS
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