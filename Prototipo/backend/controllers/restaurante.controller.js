const db = require('../database/db');
const fs = require('fs');
const path = require('path');

// --- LISTAR TODOS OS RESTAURANTES (PARA CLIENTES) ---
exports.listarTodosRestaurantes = (req, res) => {
    const sql = `
        SELECT 
            r.id_restaurante, r.nome, r.taxa_frete, r.nota_avaliacao, r.url_imagem_logo,
            c.nome AS nome_cozinha
        FROM 
            restaurantes r
        LEFT JOIN 
            cozinhas c ON r.id_cozinha = c.id_cozinha
        WHERE 
            r.ativo = 1
        ORDER BY
            r.nota_avaliacao DESC, r.nome ASC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar todos os restaurantes:", err.message);
            return res.status(500).json({ message: "Erro interno ao buscar lista de restaurantes." });
        }
        res.status(200).json(rows);
    });
};


// --- FUNÇÕES DE GESTÃO DO "MEU RESTAURANTE" ---

// Buscar o restaurante do usuário logado
exports.getMeuRestaurante = async (req, res) => {
    const idUsuarioResponsavel = req.usuarioDecodificado.id_usuario;
    if (!idUsuarioResponsavel) {
        return res.status(400).json({ message: "ID do usuário não encontrado no token." });
    }
    const sql = `
        SELECT r.*, c.nome AS nome_cozinha 
        FROM restaurantes r
        LEFT JOIN cozinhas c ON r.id_cozinha = c.id_cozinha
        WHERE r.id_usuario_responsavel = ?
    `;
    try {
        const restaurante = await new Promise((resolve, reject) => {
            db.get(sql, [idUsuarioResponsavel], (err, row) => {
                if (err) return reject(new Error("Erro interno ao buscar dados do restaurante."));
                resolve(row);
            });
        });
        if (!restaurante) {
            return res.status(404).json({ message: "Nenhum restaurante encontrado para este usuário." });
        }
        res.status(200).json(restaurante);
    } catch (error) {
        res.status(500).json({ message: error.message || "Erro interno no servidor ao buscar restaurante." });
    }
};

// Criar um novo restaurante
exports.criarRestaurante = async (req, res) => {
    const id_usuario_responsavel = req.usuarioDecodificado.id_usuario;
    const { nome, id_cozinha, taxa_frete = 0.0, endereco_cep, endereco_logradouro, endereco_numero, endereco_complemento, endereco_bairro, endereco_cidade, endereco_estado } = req.body;
    let url_imagem_logo = null;
    if (req.file) {
        url_imagem_logo = `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, "/")}`;
    }
    if (!nome || !id_cozinha) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Nome e Tipo de Cozinha são obrigatórios." });
    }
    try {
        const existingRestaurant = await new Promise((resolve, reject) => {
            db.get("SELECT id_restaurante FROM restaurantes WHERE id_usuario_responsavel = ?", [id_usuario_responsavel], (err, row) => {
                if (err) { reject(new Error("Erro ao verificar restaurante existente.")); }
                resolve(row);
            });
        });
        if (existingRestaurant) {
            if (req.file) { fs.unlinkSync(req.file.path); }
            return res.status(409).json({ message: "Este usuário já possui um restaurante cadastrado." });
        }

        const sql = `INSERT INTO restaurantes (nome, id_cozinha, taxa_frete, url_imagem_logo, id_usuario_responsavel, endereco_cep, endereco_logradouro, endereco_numero, endereco_complemento, endereco_bairro, endereco_cidade, endereco_estado, ativo, aberto, data_cadastro, data_atualizacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
        const params = [nome, Number(id_cozinha), Number(taxa_frete) || 0.0, url_imagem_logo, id_usuario_responsavel, endereco_cep || null, endereco_logradouro || null, endereco_numero || null, endereco_complemento || null, endereco_bairro || null, endereco_cidade || null, endereco_estado || null];
        db.run(sql, params, function (err) {
            if (err) {
                if (req.file) { fs.unlinkSync(req.file.path); }
                return res.status(500).json({ message: "Erro interno ao cadastrar o restaurante.", error: err.message });
            }
            res.status(201).json({ message: "Restaurante cadastrado com sucesso!", id_restaurante: this.lastID });
        });
    } catch(error) {
        if (req.file) { fs.unlinkSync(req.file.path); }
        res.status(500).json({ message: "Erro interno no servidor ao criar restaurante.", error: error.message });
    }
};

// Atualizar o restaurante do usuário logado
exports.atualizarMeuRestaurante = async (req, res) => {
};

// Apagar o restaurante do usuário logado
exports.apagarMeuRestaurante = async (req, res) => {
    
};