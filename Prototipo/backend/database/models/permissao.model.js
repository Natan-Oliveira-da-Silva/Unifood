module.exports = (db) => {
    const sqlCreateTable = `
        CREATE TABLE IF NOT EXISTS permissoes (
            id_permissao INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE,
            descricao TEXT
        )
    `;
    db.run(sqlCreateTable, (err) => {
        if (err) {
            console.error("Erro ao criar tabela permissoes:", err.message);
        } else {
            console.log("Tabela 'permissoes' verificada/criada com sucesso.");
            
            
            // Inserir permissoes padrão
            const stmt = db.prepare("INSERT OR IGNORE INTO permissoes (nome, descricao) VALUES (?,?)");
            const permissoesPadrao = [
                { nome: "VISUALIZAR_CARDAPIOS", descricao: "Permite visualizar cardápios de restaurantes." },
                { nome: "FAZER_PEDIDOS", descricao: "Permite realizar pedidos (clientes)." },
                { nome: "GERENCIAR_PERFIL_CLIENTE", descricao: "Permite editar o próprio perfil de cliente." },
                { nome: "GERENCIAR_RESTAURANTE", descricao: "Permite editar dados do próprio restaurante e gerenciar produtos (restaurantes)." },
                { nome: "VISUALIZAR_PEDIDOS_RESTAURANTE", descricao: "Permite visualizar pedidos recebidos pelo restaurante." },
                { nome: "ADMINISTRAR_USUARIOS", descricao: "Permite administrar todos os usuários (admin do sistema)." },
                { nome: "ADMINISTRAR_RESTAURANTES_TODOS", descricao: "Permite administrar todos os restaurantes (admin do sistema)." }
            ];

            permissoesPadrao.forEach(perm => {
                stmt.run(perm.nome, perm.descricao, function(errInsert) {
                    if (errInsert) {
                        console.error(`Erro ao inserir permissão padrão '${perm.nome}':`, errInsert.message);
                    }
                });
            });
            stmt.finalize(errFinalize => {
                if (errFinalize) {
                    console.error("Erro ao finalizar statement de permissões:", errFinalize.message);
                } else {
                    console.log("Permissões padrão processadas.");
                }
            });
        }
    });
};