// backend/controllers/restaurante.controller.js
const db = require('../database/db');

// Buscar o restaurante do usuário logado
exports.getMeuRestaurante = async (req, res) => {
    // O id_usuario vem do token JWT, decodificado pelo middleware de autenticação
    const idUsuarioResponsavel = req.usuarioDecodificado.id_usuario;

    if (!idUsuarioResponsavel) {
        return res.status(400).json({ message: "ID do usuário não encontrado no token." });
    }

    // Adicionar JOIN com cozinhas para pegar o nome da cozinha
    const sql = `
        SELECT 
            r.*, 
            c.nome AS nome_cozinha 
        FROM restaurantes r
        LEFT JOIN cozinhas c ON r.id_cozinha = c.id_cozinha
        WHERE r.id_usuario_responsavel = ?
    `;

    try {
        const restaurante = await new Promise((resolve, reject) => {
            db.get(sql, [idUsuarioResponsavel], (err, row) => {
                if (err) {
                    console.error("Erro ao buscar restaurante:", err.message);
                    reject(new Error("Erro interno ao buscar dados do restaurante."));
                }
                resolve(row);
            });
        });

        if (!restaurante) {
            
            return res.status(404).json({ message: "Nenhum restaurante encontrado para este usuário." });
        }

        res.status(200).json(restaurante);

    } catch (error) {
        console.error("Erro no processo de buscar meu restaurante:", error.message);
        res.status(500).json({ message: error.message || "Erro interno no servidor." });
    }
};

