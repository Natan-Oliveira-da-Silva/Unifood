// backend/database/models/forma_pagamento.model.js
module.exports = (db) => {
    const sql = `
        CREATE TABLE IF NOT EXISTS formas_pagamento (
            id_forma_pagamento INTEGER PRIMARY KEY AUTOINCREMENT,
            descricao TEXT NOT NULL UNIQUE
        )
    `;
    db.run(sql, (err) => {
        if (err) {
            console.error("Erro ao criar tabela formas_pagamento:", err.message);
        } else {
            console.log("Tabela 'formas_pagamento' verificada/criada com sucesso.");
            // Adiciona alguns dados padrão se a tabela estiver vazia
            db.get("SELECT COUNT(*) as count FROM formas_pagamento", (err, row) => {
                if (row && row.count === 0) {
                    const stmt = db.prepare("INSERT INTO formas_pagamento (descricao) VALUES (?)");
                    const formas = ["Cartão de Crédito", "Cartão de Débito", "Pix", "Dinheiro"];
                    formas.forEach(forma => stmt.run(forma));
                    stmt.finalize((errFinalize) => {
                        if (errFinalize) { console.error("Erro ao inserir formas de pagamento padrão:", errFinalize.message); }
                        else { console.log("Formas de pagamento padrão inseridas."); }
                    });
                }
            });
        }
    });
};