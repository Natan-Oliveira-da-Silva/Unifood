// backend/controllers/produto.controller.js
const { db } = require('../database/db.js');

// --- LISTAR PRODUTOS DE UM RESTAURANTE (PÚBLICO) ---
// Mantendo sua função original que já estava correta.
exports.listarProdutosDeUmRestaurante = (req, res) => {
    const { id: id_restaurante } = req.params;
    const sql = "SELECT * FROM produtos WHERE id_restaurante = ? AND ativo = 1 ORDER BY nome ASC";

    db.all(sql, [id_restaurante], (err, rows) => {
        if (err) return res.status(500).json({ message: "Erro interno ao buscar produtos." });
        res.status(200).json(rows);
    });
};

// --- CRIAR UM NOVO PRODUTO ---
exports.criarProduto = async (req, res) => {
    try {
        const { nome, descricao, preco } = req.body;
        const idUsuarioResponsavel = req.usuarioDecodificado.id_usuario;

        if(!nome || !preco) {
            return res.status(400).json({ message: "Nome e preço são obrigatórios." });
        }

        const restaurante = await new Promise((resolve, reject) => {
            db.get("SELECT id_restaurante FROM restaurantes WHERE id_usuario_responsavel = ?", [idUsuarioResponsavel], (err, row) => {
                if (err) return reject(new Error("Erro interno ao localizar restaurante."));
                if (!row) return reject(new Error("Nenhum restaurante encontrado para este usuário."));
                resolve(row);
            });
        });
        
        const urlImagemProduto = req.file ? `/uploads/${req.file.filename}` : null;
        const sql = `INSERT INTO produtos (nome, descricao, preco, url_imagem, id_restaurante) VALUES (?, ?, ?, ?, ?)`;
        const params = [nome, descricao, parseFloat(preco), urlImagemProduto, restaurante.id_restaurante];

        db.run(sql, params, function(err) {
            if (err) return res.status(500).json({ message: "Erro ao cadastrar produto no banco de dados." });
            res.status(201).json({ message: "Produto criado com sucesso!", id_produto: this.lastID });
        });
    } catch (error) {
        if (error.message.includes("Nenhum restaurante encontrado")) {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: "Ocorreu um erro inesperado no servidor." });
    }
};

// --- LISTAR OS PRODUTOS DO RESTAURANTE LOGADO ---
exports.listarMeusProdutos = async (req, res) => {
    try {
        const idUsuarioLogado = req.usuarioDecodificado.id_usuario;

        const restaurante = await new Promise((resolve, reject) => {
            db.get("SELECT id_restaurante FROM restaurantes WHERE id_usuario_responsavel = ?", [idUsuarioLogado], (err, row) => {
                if (err) return reject(new Error("Erro de banco de dados."));
                if (!row) return reject(new Error("Restaurante não encontrado para este usuário."));
                resolve(row);
            });
        });

        const sql = "SELECT * FROM produtos WHERE id_restaurante = ? ORDER BY nome ASC";
        db.all(sql, [restaurante.id_restaurante], (err, rows) => {
            if (err) return res.status(500).json({ message: "Erro interno ao buscar produtos." });
            res.status(200).json(rows);
        });
    } catch (error) {
        const statusCode = error.message.includes("não encontrado") ? 404 : 500;
        res.status(statusCode).json({ message: error.message });
    }
};

// --- ATUALIZAR UM PRODUTO ---
exports.atualizarProduto = async (req, res) => {
    // A lógica completa de atualização viria aqui.
    // Por enquanto, ela confirma que a rota funciona.
    res.status(501).json({ message: "Funcionalidade de atualizar ainda não implementada." });
};

// --- APAGAR UM PRODUTO ---
exports.apagarProduto = async (req, res) => {
    try {
        const idUsuarioLogado = req.usuarioDecodificado.id_usuario;
        const { id: idProduto } = req.params;

        const sqlVerifica = `
            SELECT p.id_produto FROM produtos p
            JOIN restaurantes r ON p.id_restaurante = r.id_restaurante
            WHERE p.id_produto = ? AND r.id_usuario_responsavel = ?
        `;
        const produto = await new Promise((resolve, reject) => {
            db.get(sqlVerifica, [idProduto, idUsuarioLogado], (err, row) => {
                if (err) return reject(new Error("Erro de banco de dados."));
                if (!row) return reject(new Error("Produto não encontrado ou não pertence ao seu restaurante."));
                resolve(row);
            });
        });

        const sqlDelete = "DELETE FROM produtos WHERE id_produto = ?";
        db.run(sqlDelete, [produto.id_produto], function (err) {
            if (err) return res.status(500).json({ message: "Erro ao apagar o produto." });
            res.status(200).json({ message: "Produto apagado com sucesso!" });
        });

    } catch (error) {
        const statusCode = error.message.includes("não encontrado") ? 404 : 500;
        res.status(statusCode).json({ message: error.message });
    }
};

// ✅ CORREÇÃO: Garantindo que TODAS as funções sejam exportadas corretamente.
module.exports = {
    criarProduto: exports.criarProduto,
    listarMeusProdutos: exports.listarMeusProdutos,
    atualizarProduto: exports.atualizarProduto,
    apagarProduto: exports.apagarProduto,
    listarProdutosDeUmRestaurante: exports.listarProdutosDeUmRestaurante
};