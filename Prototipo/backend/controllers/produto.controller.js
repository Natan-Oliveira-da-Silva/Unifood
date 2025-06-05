
const db = require('../database/db');
const fs = require('fs');
const path = require('path');

// --- CRIAR UM NOVO PRODUTO ---
exports.criarProduto = async (req, res) => {
    const id_usuario_responsavel = req.usuarioDecodificado.id_usuario;
    const { nome, descricao, preco, categoria } = req.body;

    let url_imagem_principal = null;
    if (req.file) {
        url_imagem_principal = `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, "/")}`;
    }

    if (!nome || !preco) {
        if (req.file) fs.unlinkSync(req.file.path); 
        return res.status(400).json({ message: "Nome e Preço são campos obrigatórios." });
    }
    if (isNaN(parseFloat(preco)) || parseFloat(preco) < 0) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "O preço deve ser um número não negativo." });
    }

    try {
        const restaurante = await new Promise((resolve, reject) => {
            db.get("SELECT id_restaurante FROM restaurantes WHERE id_usuario_responsavel = ?", [id_usuario_responsavel], (err, row) => {
                if (err) return reject(new Error("Erro ao buscar restaurante do usuário."));
                resolve(row);
            });
        });

        if (!restaurante) {
            if (req.file) fs.unlinkSync(req.file.path); 
            return res.status(404).json({ message: "Nenhum restaurante encontrado para este usuário." });
        }
        const id_restaurante = restaurante.id_restaurante;

        const sql = `
            INSERT INTO produtos (id_restaurante, nome, descricao, preco, url_imagem_principal, categoria, ativo)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        `;
        const params = [id_restaurante, nome, descricao || null, parseFloat(preco), url_imagem_principal, categoria || null];

        db.run(sql, params, function (err) {
            if (err) {
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(500).json({ message: "Erro interno ao cadastrar o produto.", error: err.message });
            }
            res.status(201).json({ message: "Produto criado com sucesso!", id_produto: this.lastID });
        });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path); 
        res.status(500).json({ message: error.message || "Erro interno no servidor." });
    }
};

// --- LISTAR PRODUTOS DO RESTAURANTE DO USUÁRIO LOGADO ("Meus Produtos") ---
exports.listarProdutosDoMeuRestaurante = async (req, res) => {
   
    const id_usuario_responsavel = req.usuarioDecodificado.id_usuario;
    try {
        const restaurante = await new Promise((resolve, reject) => {
            db.get("SELECT id_restaurante FROM restaurantes WHERE id_usuario_responsavel = ?", [id_usuario_responsavel], (err, row) => {
                if (err) return reject(new Error("Erro ao buscar restaurante do usuário."));
                resolve(row);
            });
        });
        if (!restaurante) { return res.status(200).json([]); }
        
        const sql = "SELECT * FROM produtos WHERE id_restaurante = ? ORDER BY nome ASC";
        db.all(sql, [restaurante.id_restaurante], (err, rows) => {
            if (err) { return res.status(500).json({ message: "Erro interno ao buscar produtos." }); }
            res.status(200).json(rows);
        });
    } catch (error) {
        res.status(500).json({ message: error.message || "Erro interno no servidor." });
    }
};