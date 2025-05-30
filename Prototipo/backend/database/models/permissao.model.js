module.exports = (db) => {
    const sql = `
        CREATE TABLE IF NOT EXISTS permissoes (
            id_permissao INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE, -- Chave da permissão, ex: "NOME_PRODUTOS"
            descricao TEXT -- Descrição do Produto
        )
    `;
    db.run(sql, (err) => {
        if (err) {
            console.error("Erro ao criar tabela permissoes:", err.message);
        } else {
            console.log("Tabela 'permissoes' verificada/criada com sucesso.");
            
            const stmt = db.prepare("INSERT OR IGNORE INTO permissoes (nome, descricao) VALUES (?,?)");
            stmt.run("LER_CONTEUDO_CLIENTE", "Permite visualizar conteúdo destinado a clientes.");
            stmt.run("GERENCIAR_RESTAURANTE_PROPRIO", "Permite gerenciar dados e produtos do próprio restaurante.");
            stmt.run("ADMINISTRAR_SISTEMA", "Permite administrar todas as funcionalidades do sistema.");
            stmt.finalize(err_finalize => {
                if (!err_finalize) {
                    console.log("Permissões padrão para 'permissoes' inseridas/verificadas.");
                }
            });
            
        }
    });
};