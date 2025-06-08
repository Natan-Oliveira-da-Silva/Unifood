const { db } = require('../database/db.js');

// CRIAR UM NOVO PEDIDO (REQUER AUTENTICAÇÃO DE CLIENTE)
exports.criarPedido = (req, res) => {
    const id_usuario_cliente = req.usuarioDecodificado.id_usuario;
    const { id_restaurante, id_forma_pagamento, itens, observacao } = req.body;

    if (!id_restaurante || !id_forma_pagamento || !itens || itens.length === 0) {
        return res.status(400).json({ message: "Dados do pedido incompletos." });
    }

    const placeholders = itens.map(() => '?').join(',');
    const sqlTotal = `SELECT id_produto, preco FROM produtos WHERE id_produto IN (${placeholders})`;
    
    db.all(sqlTotal, itens.map(i => i.id_produto), (err, produtos) => {
        if (err || produtos.length !== itens.length) {
            return res.status(400).json({ message: "Um ou mais produtos são inválidos." });
        }

        let valor_total = 0;
        itens.forEach(item => {
            const produto = produtos.find(p => p.id_produto === item.id_produto);
            valor_total += produto.preco * item.quantidade;
        });

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            const sqlPedido = `INSERT INTO pedidos (id_usuario_cliente, id_restaurante, id_forma_pagamento, valor_total, observacao) VALUES (?, ?, ?, ?, ?)`;
            db.run(sqlPedido, [id_usuario_cliente, id_restaurante, id_forma_pagamento, valor_total, observacao], function(err) {
                if (err) {
                    db.run("ROLLBACK");
                    return res.status(500).json({ message: "Não foi possível criar o pedido." });
                }
                
                const id_pedido = this.lastID;
                const sqlItem = `INSERT INTO item_pedido (id_pedido, id_produto, quantidade, preco_unitario) VALUES (?, ?, ?, ?)`;
                const stmt = db.prepare(sqlItem);

                for (const item of itens) {
                    const produto = produtos.find(p => p.id_produto === item.id_produto);
                    stmt.run(id_pedido, item.id_produto, item.quantidade, produto.preco);
                }

                stmt.finalize(err => {
                    if (err) {
                        db.run("ROLLBACK");
                        return res.status(500).json({ message: "Não foi possível salvar os itens do pedido." });
                    }
                    db.run("COMMIT");
                    res.status(201).json({ message: "Pedido realizado com sucesso!", id_pedido: id_pedido });
                });
            });
        });
    });
};

// LISTAR PEDIDOS DE UM CLIENTE
exports.listarMeusPedidos = (req, res) => {
    const id_usuario_cliente = req.usuarioDecodificado.id_usuario;
    const sql = `SELECT * FROM pedidos WHERE id_usuario_cliente = ? ORDER BY data_pedido DESC`;
    
    db.all(sql, [id_usuario_cliente], (err, rows) => {
        if(err) return res.status(500).json({ message: "Erro ao buscar pedidos." });
        res.status(200).json(rows);
    });
};