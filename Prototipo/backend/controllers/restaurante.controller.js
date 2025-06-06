// backend/controllers/restaurante.controller.js
const db = require('../database/db');
const fs = require('fs');
const path = require('path');

// --- LISTAR TODOS OS RESTAURANTES (PÚBLICO) ---
exports.listarTodosRestaurantes = (req, res) => {
    const sql = `
        SELECT r.id_restaurante, r.nome, r.taxa_frete, r.nota_avaliacao, r.url_imagem_logo, c.nome AS nome_cozinha
        FROM restaurantes r
        LEFT JOIN cozinhas c ON r.id_cozinha = c.id_cozinha
        WHERE r.ativo = 1
        ORDER BY r.nota_avaliacao DESC, r.nome ASC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar todos os restaurantes:", err.message);
            return res.status(500).json({ message: "Erro interno ao buscar lista de restaurantes." });
        }
        res.status(200).json(rows);
    });
};

// --- LISTAR PRODUTOS DE UM RESTAURANTE ESPECÍFICO (PÚBLICO) ---
exports.listarProdutosDeUmRestaurante = (req, res) => {
    const { id: id_restaurante } = req.params;
    const sql = "SELECT * FROM produtos WHERE id_restaurante = ? AND ativo = 1 ORDER BY nome ASC";

    db.all(sql, [id_restaurante], (err, rows) => {
        if (err) {
            console.error(`Erro ao buscar produtos para o restaurante ${id_restaurante}:`, err.message);
            return res.status(500).json({ message: "Erro interno ao buscar produtos do restaurante." });
        }
        res.status(200).json(rows);
    });
};


// --- FUNÇÕES DE GESTÃO DO "MEU RESTAURANTE" (PRIVADAS) ---

exports.getMeuRestaurante = async (req, res) => {
    const idUsuarioResponsavel = req.usuarioDecodificado.id_usuario;
    const sql = `
        SELECT r.*, c.nome AS nome_cozinha 
        FROM restaurantes r
        LEFT JOIN cozinhas c ON r.id_cozinha = c.id_cozinha
        WHERE r.id_usuario_responsavel = ?
    `;
    try {
        const restaurante = await new Promise((resolve, reject) => {
            db.get(sql, [idUsuarioResponsavel], (err, row) => {
                if (err) return reject(new Error("Erro ao buscar dados do restaurante."));
                resolve(row);
            });
        });
        if (!restaurante) {
            return res.status(404).json({ message: "Nenhum restaurante encontrado para este usuário." });
        }
        res.status(200).json(restaurante);
    } catch (error) {
        res.status(500).json({ message: error.message || "Erro interno no servidor." });
    }
};

exports.criarRestaurante = async (req, res) => {
    // ... (código completo da função criarRestaurante que já fizemos) ...
};

exports.atualizarMeuRestaurante = async (req, res) => {
    // ... (código completo da função atualizarMeuRestaurante que já fizemos) ...
};

exports.apagarMeuRestaurante = async (req, res) => {
    // ... (código completo da função apagarMeuRestaurante que já fizemos) ...
};