module.exports = (db) => {
    const sql = `
        CREATE TABLE IF NOT EXISTS grupos (
            id_grupo INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE -- Ex: "Cliente", "Restaurante", "AdminSistema"
        )
    `;
    db.run(sql, (err) => {
        if (err) {
            console.error("Erro ao criar tabela grupos:", err.message);
        } else {
            console.log("Tabela 'grupos' verificada/criada com sucesso.");
            
            const stmt = db.prepare("INSERT OR IGNORE INTO grupos (nome) VALUES (?)");
            stmt.run("Cliente");
            stmt.run("Restaurante");
            stmt.run("AdminSistema");
            stmt.finalize(err_finalize => {
                if (!err_finalize) {
                    console.log("Grupos padrão para 'grupos' inseridos/verificados.");
                }
            });
           
        }
    });
};