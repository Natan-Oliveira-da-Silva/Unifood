// backend/database/models/pedido.model.js
module.exports = (db) => {
    const sql = `
        CREATE TABLE IF NOT EXISTS pedidos (
            id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo_pedido TEXT NOT NULL UNIQUE,
            id_usuario_cliente INTEGER NOT NULL,
            id_restaurante INTEGER NOT NULL,
            
            -- Colunas de texto simplificadas
            endereco_entrega_info TEXT,
            forma_pagamento_info TEXT,

            subtotal REAL NOT NULL,
            taxa_frete REAL DEFAULT 0.0,
            valor_total REAL NOT NULL,
            
            status_pedido TEXT NOT NULL DEFAULT 'CRIADO',
            
            data_criacao TEXT DEFAULT CURRENT_TIMESTAMP,
            data_confirmacao TEXT,
            data_saiu_entrega TEXT,
            data_entrega TEXT,
            data_cancelamento TEXT,

            FOREIGN KEY (id_usuario_cliente) REFERENCES usuarios (id_usuario) ON DELETE SET NULL,
            FOREIGN KEY (id_restaurante) REFERENCES restaurantes (id_restaurante) ON DELETE SET NULL
        )
    `;
    
    db.run(sql, (err) => {
        if (err) {
            console.error("Erro ao criar tabela pedidos:", err.message);
        } else {
            console.log("Tabela 'pedidos' (simplificada) verificada/criada com sucesso.");
        }
    });
};