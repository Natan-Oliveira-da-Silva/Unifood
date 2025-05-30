module.exports = (db) => {
    const sql = `
        CREATE TABLE IF NOT EXISTS formas_pagamento (
            id_forma_pagamento INTEGER PRIMARY KEY AUTOINCREMENT,
            descricao TEXT NOT NULL UNIQUE -- Ex: "Cartão de Crédito", "Cartão de Débito", "Pix", "Dinheiro", "Vale Refeição"
        )
    `;
    db.run(sql, (err) => {
        if (err) {
            console.error("Erro ao criar tabela formas_pagamento:", err.message);
        } else {
            console.log("Tabela 'formas_pagamento' verificada/criada com sucesso.");

        }
    });
};