
const db = require('../database/db');

// Listar todas as cozinhas
exports.listarCozinhas = (req, res) => {
    const sql = "SELECT id_cozinha, nome FROM cozinhas ORDER BY nome ASC";

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar cozinhas:", err.message);
            return res.status(500).json({ message: "Erro interno ao buscar lista de cozinhas.", error: err.message });
        }
        
        res.status(200).json(rows);
    });
};

