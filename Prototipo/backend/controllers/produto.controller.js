// backend/controllers/produto.controller.js
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

        const sql = `INSERT INTO produtos (id_restaurante, nome, descricao, preco, url_imagem_principal, categoria, ativo) VALUES (?, ?, ?, ?, ?, ?, 1)`;
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

// --- LISTAR PRODUTOS DO RESTAURANTE DO USUÁRIO LOGADO ---
exports.listarProdutosDoMeuRestaurante = async (req, res) => {
    const id_usuario_responsavel = req.usuarioDecodificado.id_usuario;
    try {
        const restaurante = await new Promise((resolve, reject) => {
            db.get("SELECT id_restaurante FROM restaurantes WHERE id_usuario_responsavel = ?", [id_usuario_responsavel], (err, row) => {
                if (err) return reject(new Error("Erro ao buscar restaurante do usuário."));
                resolve(row);
            });
        });
        if (!restaurante) {
            return res.status(200).json([]);
        }
        
        const sql = "SELECT * FROM produtos WHERE id_restaurante = ? ORDER BY nome ASC";
        db.all(sql, [restaurante.id_restaurante], (err, rows) => {
            if (err) { return res.status(500).json({ message: "Erro interno ao buscar produtos." }); }
            res.status(200).json(rows);
        });
    } catch (error) {
        res.status(500).json({ message: error.message || "Erro interno no servidor." });
    }
};

// --- ATUALIZAR UM PRODUTO ---
exports.atualizarProduto = async (req, res) => {
    const { id: id_produto_a_atualizar } = req.params;
    const id_usuario_responsavel = req.usuarioDecodificado.id_usuario;
    const { nome, descricao, preco, categoria, ativo } = req.body;

    try {
        const produto = await new Promise((resolve, reject) => {
            const sql = `SELECT p.id_produto, p.url_imagem_principal FROM produtos p JOIN restaurantes r ON p.id_restaurante = r.id_restaurante WHERE p.id_produto = ? AND r.id_usuario_responsavel = ?`;
            db.get(sql, [id_produto_a_atualizar, id_usuario_responsavel], (err, row) => {
                if (err) return reject(new Error("Erro ao verificar propriedade do produto."));
                resolve(row);
            });
        });
        if (!produto) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: "Produto não encontrado ou você não tem permissão para editá-lo." });
        }

        let camposParaAtualizar = [];
        let valoresParaAtualizar = [];

        const addCampo = (nomeCampo, valor) => { if (valor !== undefined) { camposParaAtualizar.push(`${nomeCampo} = ?`); valoresParaAtualizar.push(valor); } };
        addCampo('nome', nome);
        addCampo('descricao', descricao);
        if (preco !== undefined) addCampo('preco', parseFloat(preco));
        addCampo('categoria', categoria);
        if (ativo !== undefined) addCampo('ativo', Number(ativo));

        if (req.file) {
            const novaUrlImagem = `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, "/")}`;
            camposParaAtualizar.push("url_imagem_principal = ?");
            valoresParaAtualizar.push(novaUrlImagem);
            if (produto.url_imagem_principal) {
                try {
                    const nomeArquivoAntigo = path.basename(new URL(produto.url_imagem_principal).pathname);
                    const caminhoArquivoAntigo = path.join(__dirname, '../../uploads/produtos', nomeArquivoAntigo);
                    if (fs.existsSync(caminhoArquivoAntigo)) fs.unlinkSync(caminhoArquivoAntigo);
                } catch (e) { console.error("Erro ao deletar imagem antiga do produto:", e.message); }
            }
        }

        if (camposParaAtualizar.length === 0) {
            return res.status(400).json({ message: "Nenhum dado válido fornecido para atualização." });
        }

        const sqlUpdate = `UPDATE produtos SET ${camposParaAtualizar.join(", ")} WHERE id_produto = ?`;
        valoresParaAtualizar.push(id_produto_a_atualizar);

        db.run(sqlUpdate, valoresParaAtualizar, function (err) {
            if (err) { return res.status(500).json({ message: "Erro interno ao atualizar o produto.", error: err.message }); }
            res.status(200).json({ message: "Produto atualizado com sucesso!" });
        });

    } catch (error) {
        console.error("Erro no processo de atualização de produto:", error.message);
        res.status(500).json({ message: error.message || "Erro interno no servidor." });
    }
};

// --- DELETAR UM PRODUTO ---
exports.deletarProduto = async (req, res) => {
    const { id: id_produto_a_deletar } = req.params;
    const id_usuario_responsavel = req.usuarioDecodificado.id_usuario;

    try {
        const restaurante = await new Promise((resolve, reject) => {
            db.get("SELECT id_restaurante FROM restaurantes WHERE id_usuario_responsavel = ?", [id_usuario_responsavel], (err, row) => {
                if (err) return reject(new Error("Erro ao buscar restaurante do usuário."));
                resolve(row);
            });
        });
        if (!restaurante) { return res.status(403).json({ message: "Acesso negado. Você não gerencia um restaurante." }); }
        
        const produto = await new Promise((resolve, reject) => {
            db.get("SELECT id_produto, url_imagem_principal FROM produtos WHERE id_produto = ? AND id_restaurante = ?", [id_produto_a_deletar, restaurante.id_restaurante], (err, row) => {
                 if (err) return reject(new Error("Erro ao buscar o produto para exclusão."));
                 resolve(row);
            });
        });
        if (!produto) { return res.status(404).json({ message: "Produto não encontrado ou você não tem permissão para excluí-lo." }); }

        const sqlDelete = "DELETE FROM produtos WHERE id_produto = ?";
        db.run(sqlDelete, [id_produto_a_deletar], function(err) {
            if (err) { return res.status(500).json({ message: "Erro interno ao apagar o produto." }); }
            if (produto.url_imagem_principal) {
                try {
                    const nomeArquivo = path.basename(new URL(produto.url_imagem_principal).pathname);
                    const caminhoArquivo = path.join(__dirname, '../../uploads/produtos', nomeArquivo);
                    if (fs.existsSync(caminhoArquivo)) fs.unlinkSync(caminhoArquivo);
                } catch (e) { console.error("Não foi possível deletar o arquivo de imagem do produto:", e.message); }
            }
            res.status(200).json({ message: "Produto excluído com sucesso." });
        });
    } catch (error) {
        res.status(500).json({ message: error.message || "Erro interno no servidor." });
    }
};