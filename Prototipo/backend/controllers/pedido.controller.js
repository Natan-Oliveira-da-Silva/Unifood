// backend/controllers/pedido.controller.js
const db = require('../database/db');
const crypto = require('crypto');

exports.criarPedido = async (req, res) => {
    const id_usuario_cliente = req.usuarioDecodificado.id_usuario;
    const { itens, id_restaurante, subtotal, taxa_frete, valor_total, id_forma_pagamento, endereco_entrega } = req.body;

    if (!itens || itens.length === 0 || !id_restaurante || !id_forma_pagamento || !endereco_entrega) {
        return res.status(400).json({ message: "Dados do pedido incompletos." });
    }

    
    db.serialize(() => {
        db.run("BEGIN TRANSACTION;");

        const codigo_pedido = crypto.randomBytes(5).toString('hex').toUpperCase();
        const sqlPedido = `
            INSERT INTO pedidos (
                codigo_pedido, id_usuario_cliente, id_restaurante, id_forma_pagamento, 
                endereco_logradouro, endereco_numero, endereco_complemento, endereco_bairro, 
                id_cidade_entrega, endereco_cep, subtotal, taxa_frete, valor_total
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const paramsPedido = [
            codigo_pedido, id_usuario_cliente, id_restaurante, id_forma_pagamento,
            endereco_entrega.logradouro, endereco_entrega.numero, endereco_entrega.complemento, endereco_entrega.bairro,
            endereco_entrega.id_cidade, endereco_entrega.cep, subtotal, taxa_frete, valor_total
        ];

        // Inserimos o pedido principal e pegamos seu ID
        db.run(sqlPedido, paramsPedido, function (err) {
            if (err) {
                console.error("Erro ao inserir na tabela pedidos:", err.message);
                db.run("ROLLBACK;"); // Desfaz a transação em caso de erro
                return res.status(500).json({ message: "Erro ao criar pedido." });
            }
            const id_pedido = this.lastID;

            // Prepara o statement para inserir os itens do pedido
            const sqlItem = `
                INSERT INTO item_pedido (id_pedido, id_produto, quantidade, preco_unitario, preco_total, observacao)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const stmtItem = db.prepare(sqlItem);

            // Loop para inserir cada item do carrinho na tabela item_pedido
            for (const item of itens) {
                stmtItem.run(id_pedido, item.id_produto, item.quantity, item.preco, (item.preco * item.quantity), item.observacao || null);
            }

            stmtItem.finalize((errFinalize) => {
                if (errFinalize) {
                    console.error("Erro ao finalizar inserção de itens:", errFinalize.message);
                    db.run("ROLLBACK;");
                    return res.status(500).json({ message: "Erro ao salvar itens do pedido." });
                }

                // Se tudo deu certo, confirma a transação
                db.run("COMMIT;");
                res.status(201).json({ message: "Pedido realizado com sucesso!", id_pedido, codigo_pedido });
            });
        });
    });
};

// --- LISTAR OS PEDIDOS DO CLIENTE LOGADO ---
exports.listarMeusPedidos = async (req, res) => {
    const id_usuario_cliente = req.usuarioDecodificado.id_usuario;

    const sql = `
        SELECT 
            p.id_pedido, p.codigo_pedido, p.valor_total, p.status_pedido, p.data_criacao,
            r.nome as nome_restaurante
        FROM pedidos p
        JOIN restaurantes r ON p.id_restaurante = r.id_restaurante
        WHERE p.id_usuario_cliente = ?
        ORDER BY p.data_criacao DESC
    `;

    db.all(sql, [id_usuario_cliente], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Erro ao buscar histórico de pedidos." });
        }
        res.status(200).json(rows);
    });
};