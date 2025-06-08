module.exports = (db) => {
    const sql = `
        CREATE TABLE IF NOT EXISTS produtos (
            id_produto INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            descricao TEXT,
            preco REAL NOT NULL,
            url_imagem TEXT,
            
            -- ✅ MELHORIA: Usando INTEGER para representar booleano (padrão do SQLite)
            ativo INTEGER DEFAULT 1, 

            id_restaurante INTEGER NOT NULL,

            FOREIGN KEY (id_restaurante) REFERENCES restaurantes(id_restaurante) ON DELETE CASCADE
        );
    `;
    db.run(sql, (err) => {
        if (err) {
            console.error("Erro ao criar tabela 'produtos':", err.message);
        } else {
            console.log("Tabela 'produtos' verificada/criada com sucesso.");
        }
    });
};