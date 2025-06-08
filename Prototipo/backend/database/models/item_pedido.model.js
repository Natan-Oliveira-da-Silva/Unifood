module.exports = (db) => {
    const sql = `
        CREATE TABLE IF NOT EXISTS item_pedido (
            id_item_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
            quantidade INTEGER NOT NULL DEFAULT 1,
            preco_unitario REAL NOT NULL,

            -- Chaves Estrangeiras
            id_pedido INTEGER NOT NULL,
            id_produto INTEGER,

            FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
            FOREIGN KEY (id_produto) REFERENCES produtos(id_produto) ON DELETE SET NULL
        );
    `;
    db.run(sql, (err) => {
        if (err) console.error("Erro ao criar tabela 'item_pedido':", err.message);
    });
};