module.exports = (db) => {
    const sql = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            nome_completo TEXT,
            senha TEXT NOT NULL,
            tipo_usuario CHAR(1) NOT NULL, -- 'C' para Cliente, 'R' para Restaurante
            data_cadastro DATETIME DEFAULT (datetime('now','localtime')),
            ativo BOOLEAN DEFAULT 1
        );
    `;
    db.run(sql, (err) => {
        if (err) console.error("Erro ao criar tabela 'usuarios':", err.message);
    });
};