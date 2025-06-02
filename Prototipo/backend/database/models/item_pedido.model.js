// backend/database/models/item_pedido.model.js
module.exports = (db) => {
    const sql = `
        CREATE TABLE IF NOT EXISTS item_pedido (
            id_item_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
            id_pedido INTEGER NOT NULL,
            id_produto INTEGER NOT NULL,
            quantidade INTEGER NOT NULL CHECK (quantidade > 0),
            preco_unitario REAL NOT NULL CHECK (preco_unitario >= 0),
            preco_total REAL NOT NULL,
            observacao TEXT,
            FOREIGN KEY (id_pedido) REFERENCES pedidos (id_pedido) ON DELETE CASCADE,
            FOREIGN KEY (id_produto) REFERENCES produtos (id_produto) ON DELETE RESTRICT
        )
    `;
       db.run(sql, (err) => {
        if (err) {
            console.error("Erro ao criar tabela item_pedido:", err.message);
        } else {
            console.log("Tabela 'item_pedido' verificada/criada com sucesso.");
        }
    });
};