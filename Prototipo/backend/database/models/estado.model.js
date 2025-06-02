
module.exports = (db) => {
    const sqlCreateTable = `
        CREATE TABLE IF NOT EXISTS estados (
            id_estado INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,      -- Nome completo do estado
            uf TEXT NOT NULL UNIQUE  -- Sigla do estado
        )
    `;
    db.run(sqlCreateTable, (err) => {
        if (err) {
            console.error("Erro ao criar tabela estados:", err.message);
        } else {
            console.log("Tabela 'estados' verificada/criada com sucesso.");
            
            const stmt = db.prepare("INSERT OR IGNORE INTO estados (nome, uf) VALUES (?, ?)");
            const todosOsEstadosBrasileiros = [
                { nome: "Acre", uf: "AC" },
                { nome: "Alagoas", uf: "AL" },
                { nome: "Amapá", uf: "AP" },
                { nome: "Amazonas", uf: "AM" },
                { nome: "Bahia", uf: "BA" },
                { nome: "Ceará", uf: "CE" },
                { nome: "Distrito Federal", uf: "DF" },
                { nome: "Espírito Santo", uf: "ES" },
                { nome: "Goiás", uf: "GO" },
                { nome: "Maranhão", uf: "MA" },
                { nome: "Mato Grosso", uf: "MT" },
                { nome: "Mato Grosso do Sul", uf: "MS" },
                { nome: "Minas Gerais", uf: "MG" },
                { nome: "Pará", uf: "PA" },
                { nome: "Paraíba", uf: "PB" },
                { nome: "Paraná", uf: "PR" },
                { nome: "Pernambuco", uf: "PE" },
                { nome: "Piauí", uf: "PI" },
                { nome: "Rio de Janeiro", uf: "RJ" },
                { nome: "Rio Grande do Norte", uf: "RN" },
                { nome: "Rio Grande do Sul", uf: "RS" },
                { nome: "Rondônia", uf: "RO" },
                { nome: "Roraima", uf: "RR" },
                { nome: "Santa Catarina", uf: "SC" },
                { nome: "São Paulo", uf: "SP" },
                { nome: "Sergipe", uf: "SE" },
                { nome: "Tocantins", uf: "TO" }
            ];

            todosOsEstadosBrasileiros.forEach(est => {
                stmt.run(est.nome, est.uf, function(errInsert) {
                    if (errInsert) {
                        console.error(`Erro ao inserir estado '${est.uf}':`, errInsert.message);
                    }
                });
            });

            stmt.finalize(errFinalize => {
                if (errFinalize) {
                    console.error("Erro ao finalizar statement de inserção de estados:", errFinalize.message);
                } else {
                    console.log("Todos os estados brasileiros processados para inserção/verificação.");
                }
            });
        }
    });
};