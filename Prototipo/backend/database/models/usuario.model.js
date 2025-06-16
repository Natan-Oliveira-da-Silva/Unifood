module.exports = (db) => {
    const sql = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            nome_completo TEXT,
            senha TEXT NOT NULL,
            tipo_usuario CHAR(1) NOT NULL, -- 'C' para Cliente, 'R' para Restaurante
            
            endereco_cep TEXT,
            endereco_logradouro TEXT,
            endereco_numero TEXT,
            endereco_complemento TEXT,
            endereco_bairro TEXT,
            endereco_cidade TEXT,
            endereco_estado TEXT,
            
            data_cadastro DATETIME DEFAULT (datetime('now','localtime')),
            ativo INTEGER DEFAULT 1 -- SQLite usa INTEGER 0 para false e 1 para true
        );
    `;
    db.run(sql, (err) => {
        if (err) console.error("Erro ao criar tabela 'usuarios':", err.message);
    });
};