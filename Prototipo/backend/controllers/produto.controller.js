// backend/controllers/produto.controller.js
const { db } = require('../database/db.js');

// Nenhuma alteração necessária aqui, já estava bom.
exports.listarProdutosDeUmRestaurante = (req, res) => {
    // ... seu código ...
};

// CRIAR UM NOVO PRODUTO (REQUER AUTENTICAÇÃO DE RESTAURANTE)
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
                // ✅ MELHORIA: Rejeita com um erro específico se não encontrar
                if (!row) return reject(new Error("Nenhum restaurante encontrado para este usuário."));
                resolve(row);
            });
        });
        
        // ✅ ATENÇÃO: Verifique se a pasta /uploads/produtos/ existe ou simplifique o caminho
        const urlImagemProduto = req.file ? `/uploads/${req.file.filename}` : null;
        
        const sql = `INSERT INTO produtos (nome, descricao, preco, url_imagem, id_restaurante) VALUES (?, ?, ?, ?, ?)`;
        const params = [nome, descricao, parseFloat(preco), urlImagemProduto, restaurante.id_restaurante];

        db.run(sql, params, function(err) {
            if (err) {
                console.error("Erro ao cadastrar produto:", err);
                return res.status(500).json({ message: "Erro ao cadastrar produto no banco de dados." });
            }
            res.status(201).json({ message: "Produto criado com sucesso!", id_produto: this.lastID });
        });

    } catch (error) {
        // ✅ MELHORIA: Tratamento de erro mais específico
        console.error("Erro no controller ao criar produto:", error.message);
        // Se o erro for por não encontrar o restaurante, o status é 403 (Proibido)
        if (error.message.includes("Nenhum restaurante encontrado")) {
            return res.status(403).json({ message: error.message });
        }
        // Para outros erros (como falha no DB), o status é 500 (Erro Interno)
        res.status(500).json({ message: "Ocorreu um erro inesperado no servidor." });
    }
};

module.exports = {
    listarProdutosDeUmRestaurante: exports.listarProdutosDeUmRestaurante,
    criarProduto: exports.criarProduto
};