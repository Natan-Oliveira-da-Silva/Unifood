const { db } = require('../database/db.js');

// --- FUNÇÕES DO CLIENTE ---

exports.criarPedido = async (req, res) => {
    try {
        const idUsuarioCliente = req.usuarioDecodificado?.id_usuario;

        if (!idUsuarioCliente) {
            return res.status(401).json({ message: "Usuário não autenticado." });
        }

        const { id_restaurante, id_forma_pagamento, observacao, itens, taxa_frete } = req.body;

        if (!id_restaurante || !id_forma_pagamento || !Array.isArray(itens) || itens.length === 0) {
            return res.status(400).json({ message: "Dados do pedido incompletos." });
        }

        const dataPedido = new Date().toISOString();
        const subtotal = itens.reduce((total, item) => total + (item.preco * item.quantidade), 0);
        const valorTotal = subtotal + (Number(taxa_frete) || 0);

        const idPedido = await new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO pedidos (
                    id_usuario_cliente, id_restaurante, id_forma_pagamento,
                    observacao, data_pedido, status, valor_total
                ) VALUES (?, ?, ?, ?, ?, 'pendente', ?)
            `;
            db.run(sql, [idUsuarioCliente, id_restaurante, id_forma_pagamento, observacao, dataPedido, valorTotal], function (err) {
                if (err) {
                    console.error("Erro ao inserir pedido:", err.message);
                    return reject(err);
                }
                resolve(this.lastID);
            });
        });

        const sqlItem = `
            INSERT INTO item_pedido (id_pedido, id_produto, quantidade, preco_unitario)
            VALUES (?, ?, ?, ?)
        `;

        const promises = itens.map(item => {
            return new Promise((resolve, reject) => {
                db.run(sqlItem, [idPedido, item.id_produto, item.quantidade, item.preco], (err) => {
                    if (err) {
                        console.error("Erro ao inserir item:", item, err.message);
                        return reject(err);
                    }
                    resolve();
                });
            });
        });

        await Promise.all(promises);
        res.status(201).json({ message: "Pedido criado com sucesso!", id_pedido: idPedido });
    } catch (error) {
        console.error("Erro ao criar pedido:", error.message);
        res.status(500).json({ message: "Erro ao processar o pedido. Tente novamente." });
    }
};

exports.listarMeusPedidos = async (req, res) => {
    try {
        const idUsuario = req.usuarioDecodificado?.id_usuario;
        if (!idUsuario) {
            return res.status(401).json({ message: "Usuário não autenticado." });
        }

const pedidos = await new Promise((resolve, reject) => {
    db.all(`
        SELECT p.*, r.nome AS nome_restaurante, fp.nome AS forma_pagamento_nome
        FROM pedidos p
        JOIN restaurantes r ON p.id_restaurante = r.id_restaurante
        LEFT JOIN formas_pagamento fp ON p.id_forma_pagamento = fp.id_forma_pagamento
        WHERE p.id_usuario_cliente = ?
        ORDER BY p.data_pedido DESC
    `, [idUsuario], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
    });
});

        if (pedidos.length === 0) return res.status(200).json([]);

        const idsPedidos = pedidos.map(p => p.id_pedido);
        const placeholders = idsPedidos.map(() => '?').join(',');

        const itens = await new Promise((resolve, reject) => {
            db.all(`
                SELECT ip.*, prod.nome AS nome_produto, prod.url_imagem 
                FROM item_pedido ip
                JOIN produtos prod ON ip.id_produto = prod.id_produto
                WHERE ip.id_pedido IN (${placeholders})
            `, idsPedidos, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });

        const pedidosComItens = pedidos.map(p => ({
            ...p,
            itens: itens.filter(i => i.id_pedido === p.id_pedido)
        }));

        res.status(200).json(pedidosComItens);
    } catch (error) {
        console.error("Erro ao listar pedidos do cliente:", error.message);
        res.status(500).json({ message: "Erro ao buscar seus pedidos." });
    }
};
exports.avaliarPedido = async (req, res) => {
    // ... implementar futuramente
};

// --- FUNÇÕES DO RESTAURANTE ---

exports.listarPedidosRestaurante = async (req, res) => {
    try {
        const idUsuarioLogado = req.usuarioDecodificado.id_usuario;

        const restaurante = await new Promise((resolve, reject) => {
            db.get("SELECT id_restaurante FROM restaurantes WHERE id_usuario_responsavel = ?", [idUsuarioLogado], (err, row) => {
                if (err || !row) return reject(new Error("Restaurante não encontrado para este usuário."));
                resolve(row);
            });
        });

        const sqlPedidos = `
            SELECT 
                p.*, 
                u.nome_completo as nome_cliente,
                u.endereco_logradouro, u.endereco_numero, u.endereco_bairro, u.endereco_cidade, u.endereco_estado, u.endereco_cep,
                fp.nome as forma_pagamento_nome
            FROM pedidos p
            LEFT JOIN usuarios u ON p.id_usuario_cliente = u.id_usuario
            LEFT JOIN formas_pagamento fp ON p.id_forma_pagamento = fp.id_forma_pagamento
            WHERE p.id_restaurante = ? 
            ORDER BY p.data_pedido DESC
        `;

        const pedidos = await new Promise((resolve, reject) => {
            db.all(sqlPedidos, [restaurante.id_restaurante], (err, rows) => {
                if (err) return reject(new Error("Erro ao buscar pedidos."));
                resolve(rows);
            });
        });

        if (pedidos.length === 0) {
            return res.status(200).json([]);
        }

        const idsPedidos = pedidos.map(p => p.id_pedido);
        const placeholders = idsPedidos.map(() => '?').join(',');
        const sqlItens = `
            SELECT ip.*, prod.nome as nome_produto, prod.url_imagem 
            FROM item_pedido ip 
            JOIN produtos prod ON ip.id_produto = prod.id_produto 
            WHERE ip.id_pedido IN (${placeholders})
        `;

        const todosOsItens = await new Promise((resolve, reject) => {
            db.all(sqlItens, idsPedidos, (err, rows) => {
                if (err) return reject(new Error("Erro ao buscar itens do pedido."));
                resolve(rows);
            });
        });

        const pedidosCompletos = pedidos.map(pedido => ({
            ...pedido,
            itens: todosOsItens.filter(item => item.id_pedido === pedido.id_pedido)
        }));

        res.status(200).json(pedidosCompletos);

    } catch (error) {
        console.error("Erro ao listar pedidos para o restaurante:", error.message);
        res.status(500).json({ message: error.message || "Erro interno ao buscar pedidos." });
    }
};

exports.atualizarStatusPedido = async (req, res) => {
    // ... implementar futuramente
};

exports.contarPedidosNaoFinalizados = async (req, res) => {
    // ... implementar futuramente
};

module.exports = {
    criarPedido: exports.criarPedido,
    listarMeusPedidos: exports.listarMeusPedidos,
    avaliarPedido: exports.avaliarPedido,
    listarPedidosRestaurante: exports.listarPedidosRestaurante,
    atualizarStatusPedido: exports.atualizarStatusPedido,
    contarPedidosNaoFinalizados: exports.contarPedidosNaoFinalizados
};
