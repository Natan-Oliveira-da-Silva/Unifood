module.exports = (db) => {
    const sql = `
        CREATE TABLE IF NOT EXISTS restaurante_formas_pagamento (
            id_restaurante INTEGER NOT NULL,
            id_forma_pagamento INTEGER NOT NULL,
            -- data_associacao TEXT DEFAULT CURRENT_TIMESTAMP, -- Opcional, se quiser rastrear quando foi associado
            PRIMARY KEY (id_restaurante, id_forma_pagamento),
            FOREIGN KEY (id_restaurante) REFERENCES restaurantes (id_restaurante) ON DELETE CASCADE,
            FOREIGN KEY (id_forma_pagamento) REFERENCES formas_pagamento (id_forma_pagamento) ON DELETE CASCADE
        )
    `;
    db.run(sql, (err) => {
        if (err) {
            console.error("Erro ao criar tabela restaurante_formas_pagamento:", err.message);
        } else {
            console.log("Tabela 'restaurante_formas_pagamento' verificada/criada com sucesso.");
        }
    });
};