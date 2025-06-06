const db = require('../database/db');
const crypto = require('crypto');

exports.criarPedido = async (req, res) => {
    const id_usuario_cliente = req.usuarioDecodificado.id_usuario;
    const { itens, id_restaurante, subtotal, taxa_frete, valor_total, forma_pagamento_info, endereco_entrega_info } = req.body;

    if (!itens || itens.length === 0 || !id_restaurante) {
        return res.status(400).json({ message: "Dados do pedido incompletos." });
    }

    db.serialize(() => {
        db.run("BEGIN TRANSACTION;");

        const codigo_pedido = crypto.randomBytes(5).toString('hex').toUpperCase();
        const sqlPedido = `
            INSERT INTO pedidos (
                codigo_pedido, id_usuario_cliente, id_restaurante, 
                subtotal, taxa_frete, valor_total, status_pedido,
                forma_pagamento_info, endereco_entrega_info
            ) VALUES (?, ?, ?, ?, ?, ?, 'CRIADO', ?, ?)
        `;
        const paramsPedido = [
            codigo_pedido, id_usuario_cliente, id_restaurante,
            subtotal, taxa_frete, valor_total,
            forma_pagamento_info || 'Não informado', 
            endereco_entrega_info || 'Não informado'
        ];

        db.run(sqlPedido, paramsPedido, function (err) {
            if (err) {
                console.error("Erro ao inserir na tabela pedidos:", err.message);
                db.run("ROLLBACK;");
                return res.status(500).json({ message: "Erro ao criar pedido.", error: err.message });
            }
            const id_pedido = this.lastID;

            const sqlItem = `INSERT INTO item_pedido (id_pedido, id_produto, quantidade, preco_unitario, preco_total) VALUES (?, ?, ?, ?, ?)`;
            const stmtItem = db.prepare(sqlItem);

            for (const item of itens) {
                stmtItem.run(id_pedido, item.id_produto, item.quantity, item.preco, (item.preco * item.quantity));
            }

            stmtItem.finalize((errFinalize) => {
                if (errFinalize) {
                    db.run("ROLLBACK;");
                    return res.status(500).json({ message: "Erro ao salvar itens do pedido." });
                }
                
                db.run("COMMIT;");
                res.status(201).json({ message: "Pedido realizado com sucesso!", id_pedido, codigo_pedido });
            });
        });
    });
};

exports.listarMeusPedidos = async (req, res) => {
    const id_usuario_cliente = req.usuarioDecodificado.id_usuario;
    const sql = `
        SELECT p.id_pedido, p.codigo_pedido, p.valor_total, p.status_pedido, p.data_criacao, r.nome as nome_restaurante
        FROM pedidos p
        LEFT JOIN restaurantes r ON p.id_restaurante = r.id_restaurante
        WHERE p.id_usuario_cliente = ?
        ORDER BY p.data_criacao DESC
    `;
    db.all(sql, [id_usuario_cliente], (err, rows) => {
        if (err) { return res.status(500).json({ message: "Erro ao buscar histórico de pedidos." }); }
        res.status(200).json(rows);
    });
};