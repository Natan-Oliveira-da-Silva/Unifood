module.exports = (db) => {
    const sql = `
        CREATE TABLE IF NOT EXISTS pedidos (
            id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
            valor_total REAL NOT NULL,
            status TEXT NOT NULL DEFAULT 'Recebido',
            data_pedido DATETIME DEFAULT (datetime('now','localtime')),
            observacao TEXT,
            
            motivo_cancelamento TEXT,

            nota_avaliacao INTEGER,
            comentario_avaliacao TEXT,

            id_usuario_cliente INTEGER,
            id_restaurante INTEGER,
            id_forma_pagamento INTEGER,
            
            FOREIGN KEY (id_usuario_cliente) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
            FOREIGN KEY (id_restaurante) REFERENCES restaurantes(id_restaurante) ON DELETE SET NULL,
            FOREIGN KEY (id_forma_pagamento) REFERENCES formas_pagamento(id_forma_pagamento) ON DELETE SET NULL
        );
    `;
    db.run(sql, (err) => {
        if (err) {
            console.error("Erro ao criar tabela 'pedidos':", err.message);
        } else {
            console.log("Tabela 'pedidos' verificada/criada com sucesso.");
        }
    });
};
