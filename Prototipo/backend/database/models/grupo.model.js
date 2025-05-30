module.exports = (db) => {
    const sqlCreateTable = `
        CREATE TABLE IF NOT EXISTS grupos (
            id_grupo INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE
        )
    `;
    db.run(sqlCreateTable, (err) => {
        if (err) {
            console.error("Erro ao criar tabela grupos:", err.message);
        } else {
            console.log("Tabela 'grupos' verificada/criada com sucesso.");
           
            // Inserir grupos padrão
            const stmt = db.prepare("INSERT OR IGNORE INTO grupos (nome) VALUES (?)");
            const gruposPadrao = ["Cliente", "Restaurante", "AdminSistema"];

            gruposPadrao.forEach(grupo => {
                stmt.run(grupo, function(errInsert) { 
                    if (errInsert) {
                        console.error(`Erro ao inserir grupo padrão '${grupo}':`, errInsert.message);
                    } else {                        
                        if (this.changes > 0) {
                        console.log(`Grupo padrão '${grupo}' inserido/verificado.`);
                        }
                    }
                });
            });
            stmt.finalize(errFinalize => {
                if (errFinalize) {
                    console.error("Erro ao finalizar statement de grupos:", errFinalize.message);
                } else {
                    console.log("Grupos padrão ('Cliente', 'Restaurante', 'AdminSistema') processados.");
                }
            });
        }
    });
};