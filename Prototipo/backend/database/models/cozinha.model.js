module.exports = (db) => {
    const sqlCreateTable = `
        CREATE TABLE IF NOT EXISTS cozinhas (
            id_cozinha INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE
        )
    `;
    db.run(sqlCreateTable, (err) => {
        if (err) {
            console.error("Erro ao criar tabela 'cozinhas':", err.message);
        } else {
            // Insere dados padrão apenas se a tabela for criada vazia
            const sqlCheck = "SELECT COUNT(id_cozinha) as count FROM cozinhas";
            db.get(sqlCheck, (errCheck, row) => {
                if (errCheck) return;
                if (row && row.count === 0) {
                    console.log("Inserindo cozinhas padrão...");
                    const cozinhas = ["Brasileira", "Italiana", "Japonesa", "Mexicana", "Chinesa", "Indiana", "Árabe", "Fast Food", "Variada"];
                    const stmt = db.prepare("INSERT INTO cozinhas (nome) VALUES (?)");
                    cozinhas.forEach(c => stmt.run(c));
                    stmt.finalize();
                }
            });
        }
    });
};