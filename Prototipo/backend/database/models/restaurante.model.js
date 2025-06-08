module.exports = (db) => {
    const createRestauranteTable = `
        CREATE TABLE IF NOT EXISTS restaurantes (
            id_restaurante INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            taxa_frete REAL DEFAULT 0.0,
            id_cozinha INTEGER,
            url_imagem_logo TEXT,
            id_usuario_responsavel INTEGER NOT NULL,
            
            -- Colunas de endereço que estavam faltando --
            endereco_cep TEXT,
            endereco_logradouro TEXT,
            endereco_numero TEXT,
            endereco_complemento TEXT,
            endereco_bairro TEXT,
            endereco_cidade TEXT,
            endereco_estado TEXT,
            
            ativo INTEGER DEFAULT 1,
            nota_avaliacao REAL DEFAULT 0.0,
            
            FOREIGN KEY (id_cozinha) REFERENCES cozinhas(id_cozinha),
            FOREIGN KEY (id_usuario_responsavel) REFERENCES usuarios(id_usuario)
        );
    `;

    db.run(createRestauranteTable, (err) => {
        if (err) {
            console.error("Erro ao criar a tabela 'restaurantes'.", err.message);
        } else {
            console.log("Tabela 'restaurantes' verificada/criada com sucesso.");
        }
    });
};