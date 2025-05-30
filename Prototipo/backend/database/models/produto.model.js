module.exports = (db) => {
    const sql = `
        CREATE TABLE IF NOT EXISTS produtos (
            id_produto INTEGER PRIMARY KEY AUTOINCREMENT,
            id_restaurante INTEGER NOT NULL,
            nome TEXT NOT NULL,
            descricao TEXT,
            preco REAL NOT NULL,
            ativo INTEGER DEFAULT 1,
            categoria TEXT,
            url_imagem_principal TEXT,
            data_cadastro TEXT DEFAULT CURRENT_TIMESTAMP,
            data_atualizacao TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_restaurante) REFERENCES restaurantes (id_restaurante) ON DELETE CASCADE
        )
    `;
    db.run(sql, (err) => {
        if (err) {
            console.error("Erro ao criar tabela produtos:", err.message);
        } else {
            console.log("Tabela 'produtos' verificada/criada com sucesso.");
        }
    });
};