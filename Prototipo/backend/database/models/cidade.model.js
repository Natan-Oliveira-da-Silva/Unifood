module.exports = (db) => {
    db.run(`CREATE TABLE IF NOT EXISTS cidades (
        id_cidade INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        id_estado INTEGER NOT NULL,
        FOREIGN KEY (id_estado) REFERENCES estados(id_estado) ON DELETE CASCADE
    )`, (err) => {
        if(err) console.error("Erro ao criar tabela 'cidades'", err.message);
    });
};