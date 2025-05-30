module.exports = (db) => {
    const sql = `
        CREATE TABLE IF NOT EXISTS foto_produtos (
            id_foto_produto INTEGER PRIMARY KEY AUTOINCREMENT,
            id_produto INTEGER NOT NULL,
            nome_arquivo TEXT,
            descricao_foto TEXT,
            content_type TEXT,
            tamanho_bytes INTEGER,
            url_foto TEXT NOT NULL,
            data_upload TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_produto) REFERENCES produtos (id_produto) ON DELETE CASCADE
        )
    `;
    db.run(sql, (err) => {
        if (err) {
            console.error("Erro ao criar tabela foto_produtos:", err.message);
        } else {
            console.log("Tabela 'foto_produtos' verificada/criada com sucesso.");
        }
    });
};