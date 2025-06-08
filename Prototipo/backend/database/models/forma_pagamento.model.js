module.exports = (db) => {
    const sqlCreateTable = `
        CREATE TABLE IF NOT EXISTS formas_pagamento (
            id_forma_pagamento INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE
        );
    `;
    db.run(sqlCreateTable, (err) => {
        if (err) {
            console.error("Erro ao criar tabela 'formas_pagamento':", err.message);
        } else {
            // Insere dados padrão
            const sqlCheck = "SELECT COUNT(id_forma_pagamento) as count FROM formas_pagamento";
            db.get(sqlCheck, (errCheck, row) => {
                if (errCheck) return;
                if (row && row.count === 0) {
                    console.log("Inserindo formas de pagamento padrão...");
                    const formas = ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Pix"];
                    const stmt = db.prepare("INSERT INTO formas_pagamento (nome) VALUES (?)");
                    formas.forEach(f => stmt.run(f));
                    stmt.finalize();
                }
            });
        }
    });
};