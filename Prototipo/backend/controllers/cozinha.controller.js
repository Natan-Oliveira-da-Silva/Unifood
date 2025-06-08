const { db } = require('../database/db.js');

// LISTAR TODAS AS COZINHAS
exports.listarCozinhas = (req, res) => {
    const sql = "SELECT id_cozinha, nome FROM cozinhas ORDER BY nome ASC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Erro interno ao buscar lista de cozinhas." });
        }
        res.status(200).json(rows);
    });
};