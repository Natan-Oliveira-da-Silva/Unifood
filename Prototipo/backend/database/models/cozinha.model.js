// backend/database/models/cozinha.model.js
module.exports = (db) => {
    const sqlCreateTable = `
        CREATE TABLE IF NOT EXISTS cozinhas (
            id_cozinha INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE
        )
    `;
    db.run(sqlCreateTable, (err) => {
        if (err) {
            console.error("Erro ao criar tabela cozinhas:", err.message);
        } else {
            console.log("Tabela 'cozinhas' verificada/criada com sucesso.");
            
            // Lógica de Seeding: Adiciona dados padrão se a tabela estiver vazia
            const sqlCheck = "SELECT COUNT(*) as count FROM cozinhas";
            db.get(sqlCheck, (errCheck, row) => {
                if (errCheck) {
                    console.error("Erro ao verificar cozinhas para seeding:", errCheck.message);
                    return;
                }
                if (row && row.count === 0) {
                    console.log("Tabela 'cozinhas' vazia, inserindo dados padrão...");
                    const stmt = db.prepare("INSERT INTO cozinhas (nome) VALUES (?)");
                    const cozinhasPadrao = ["Brasileira", "Italiana", "Japonesa", "Mexicana", "Chinesa", "Indiana", "Árabe", "Fast Food", "Variada"];
                    cozinhasPadrao.forEach(cozinha => {
                        stmt.run(cozinha, (errInsert) => {
                            if (errInsert && !errInsert.message.includes('UNIQUE constraint failed')) {
                                 console.error(`Erro ao inserir cozinha padrão '${cozinha}':`, errInsert.message);
                            }
                        });
                    });
                    stmt.finalize((errFinalize) => {
                        if(errFinalize) console.error("Erro ao finalizar statement de cozinhas:", errFinalize.message);
                        else console.log("Cozinhas padrão inseridas com sucesso.");
                    });
                }
            });
        }
    });
};