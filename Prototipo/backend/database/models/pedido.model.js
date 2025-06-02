// backend/database/models/pedido.model.js
module.exports = (db) => {
    const sql = `
        CREATE TABLE IF NOT EXISTS pedidos (
            id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo_pedido TEXT NOT NULL UNIQUE,
            id_usuario_cliente INTEGER NOT NULL,
            id_restaurante INTEGER NOT NULL,
            id_forma_pagamento INTEGER NOT NULL,
            
            endereco_logradouro TEXT NOT NULL,
            endereco_numero TEXT,
            endereco_complemento TEXT,
            endereco_bairro TEXT NOT NULL,
            id_cidade_entrega INTEGER NOT NULL,
            endereco_cep TEXT NOT NULL,
            
            subtotal REAL NOT NULL,
            taxa_frete REAL DEFAULT 0.0,
            valor_total REAL NOT NULL,
            
            status_pedido TEXT NOT NULL DEFAULT 'CRIADO',
            
            data_criacao TEXT DEFAULT CURRENT_TIMESTAMP,
            data_confirmacao TEXT,
            data_saiu_entrega TEXT,
            data_entrega TEXT,
            data_cancelamento TEXT,
            observacao_cliente TEXT,

            FOREIGN KEY (id_usuario_cliente) REFERENCES usuarios (id_usuario) ON DELETE RESTRICT,
            FOREIGN KEY (id_restaurante) REFERENCES restaurantes (id_restaurante) ON DELETE RESTRICT,
            FOREIGN KEY (id_forma_pagamento) REFERENCES formas_pagamento (id_forma_pagamento) ON DELETE RESTRICT,
            FOREIGN KEY (id_cidade_entrega) REFERENCES cidades (id_cidade) ON DELETE RESTRICT
        )
    `;
 
    db.run(sql, (err) => {
        if (err) {
            console.error("Erro ao criar tabela pedidos:", err.message);
        } else {
            console.log("Tabela 'pedidos' verificada/criada com sucesso.");
        }
    });
};