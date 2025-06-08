const { db } = require('../database/db.js');

// LISTAR PRODUTOS DE UM RESTAURANTE (PÚBLICO)
exports.listarProdutosDeUmRestaurante = (req, res) => {
    const { id: id_restaurante } = req.params;
    const sql = "SELECT * FROM produtos WHERE id_restaurante = ? AND ativo = 1 ORDER BY nome ASC";

    db.all(sql, [id_restaurante], (err, rows) => {
        if (err) return res.status(500).json({ message: "Erro interno ao buscar produtos." });
        res.status(200).json(rows);
    });
};

// CRIAR UM NOVO PRODUTO (REQUER AUTENTICAÇÃO DE RESTAURANTE)
exports.criarProduto = async (req, res) => {
    try {
        const { nome, descricao, preco } = req.body;
        const idUsuarioResponsavel = req.usuarioDecodificado.id_usuario;

        if(!nome || !preco) {
            return res.status(400).json({ message: "Nome e preço são obrigatórios." });
        }

        // Primeiro, encontra o restaurante do usuário logado
        const restaurante = await new Promise((resolve, reject) => {
            db.get("SELECT id_restaurante FROM restaurantes WHERE id_usuario_responsavel = ?", [idUsuarioResponsavel], (err, row) => {
                if (err) return reject(new Error("Erro ao localizar restaurante do usuário."));
                if (!row) return reject(new Error("Nenhum restaurante encontrado para este usuário."));
                resolve(row);
            });
        });
        
        const urlImagemProduto = req.file ? `/uploads/produtos/${req.file.filename}` : null;
        const sql = `INSERT INTO produtos (nome, descricao, preco, url_imagem, id_restaurante) VALUES (?, ?, ?, ?, ?)`;
        const params = [nome, descricao, parseFloat(preco), urlImagemProduto, restaurante.id_restaurante];

        db.run(sql, params, function(err) {
            if (err) return res.status(500).json({ message: "Erro ao cadastrar produto." });
            res.status(201).json({ message: "Produto criado com sucesso!", id_produto: this.lastID });
        });

    } catch (error) {
        res.status(403).json({ message: error.message });
    }
};

