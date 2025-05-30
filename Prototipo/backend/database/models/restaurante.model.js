// backend/database/models/restaurante.model.js
module.exports = (db) => {

    const sqlSafe = `
        CREATE TABLE IF NOT EXISTS restaurantes (
            id_restaurante INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            taxa_frete REAL DEFAULT 0.0,
            ativo INTEGER DEFAULT 1, 
            aberto INTEGER DEFAULT 0, 
            url_imagem_logo TEXT,
            id_cozinha INTEGER NOT NULL,
            endereco_cep TEXT,
            endereco_logradouro TEXT,
            endereco_numero TEXT,
            endereco_complemento TEXT,
            endereco_bairro TEXT,
            endereco_cidade TEXT,
            endereco_estado TEXT,
            data_cadastro TEXT DEFAULT CURRENT_TIMESTAMP,
            data_atualizacao TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_cozinha) REFERENCES cozinhas (id_cozinha) ON UPDATE CASCADE ON DELETE RESTRICT
        )
    `;


    db.run(sqlSafe, (err) => {
        if (err) {
            console.error("Erro ao criar tabela restaurantes:", err.message);
        } else {
            console.log("Tabela 'restaurantes' verificada/criada com sucesso.");
        }
    });
};