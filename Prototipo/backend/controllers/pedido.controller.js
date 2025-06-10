const { db } = require('../database/db.js');

// --- FUNÇÕES DO CLIENTE ---

exports.criarPedido = async (req, res) => {
    const id_usuario_cliente = req.usuarioDecodificado.id_usuario;
    const { id_restaurante, id_forma_pagamento, itens, observacao } = req.body;

    if (!id_restaurante || !id_forma_pagamento || !itens || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ message: "Dados do pedido incompletos ou inválidos." });
    }

    try {
        await new Promise((resolve, reject) => db.run("BEGIN TRANSACTION;", (err) => err ? reject(err) : resolve()));

        const idsProdutos = itens.map(i => i.id_produto);
        const placeholders = idsProdutos.map(() => '?').join(',');
        const sqlPrecos = `SELECT id_produto, preco FROM produtos WHERE id_produto IN (${placeholders})`;
        
        const produtosDoBanco = await new Promise((resolve, reject) => {
            db.all(sqlPrecos, idsProdutos, (err, rows) => {
                if (err) return reject(new Error("Erro ao validar produtos."));
                if (rows.length !== idsProdutos.length) return reject(new Error("Um ou mais produtos no carrinho são inválidos."));
                resolve(rows);
            });
        });

        let valor_total = 0;
        const mapaDePrecos = new Map(produtosDoBanco.map(p => [p.id_produto, p.preco]));
        itens.forEach(item => {
            valor_total += mapaDePrecos.get(item.id_produto) * item.quantidade;
        });

        const sqlPedido = `INSERT INTO pedidos (id_usuario_cliente, id_restaurante, id_forma_pagamento, valor_total, observacao) VALUES (?, ?, ?, ?, ?)`;
        const { lastID: id_pedido } = await new Promise((resolve, reject) => {
            db.run(sqlPedido, [id_usuario_cliente, id_restaurante, id_forma_pagamento, valor_total, observacao], function(err) {
                if (err) return reject(new Error("Não foi possível registrar o pedido."));
                resolve(this);
            });
        });

        const sqlItem = `INSERT INTO item_pedido (id_pedido, id_produto, quantidade, preco_unitario) VALUES (?, ?, ?, ?)`;
        const stmt = db.prepare(sqlItem);
        for (const item of itens) {
            const precoDoBanco = mapaDePrecos.get(item.id_produto);
            await new Promise((resolve, reject) => {
                stmt.run([id_pedido, item.id_produto, item.quantidade, precoDoBanco], (err) => {
                    if(err) return reject(new Error("Não foi possível registrar um item do pedido."));
                    resolve();
                });
            });
        }
        stmt.finalize();

        await new Promise((resolve, reject) => db.run("COMMIT;", (err) => err ? reject(err) : resolve()));
        res.status(201).json({ message: "Pedido realizado com sucesso!", id_pedido: id_pedido });

    } catch (error) {
        await new Promise((resolve, reject) => db.run("ROLLBACK;", (err) => err ? reject(err) : resolve()));
        console.error("Erro na transação ao criar pedido:", error.message);
        res.status(500).json({ message: error.message || "Ocorreu um erro ao processar seu pedido." });
    }
};

exports.listarMeusPedidos = async (req, res) => {
    // Implementação para o cliente listar seus pedidos...
};

exports.avaliarPedido = async (req, res) => {
    // Implementação para o cliente avaliar um pedido...
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
            SELECT p.*, u.nome_completo as nome_cliente, u.endereco_logradouro, u.endereco_numero, u.endereco_bairro, u.endereco_cidade, u.endereco_estado, u.endereco_cep, fp.nome as forma_pagamento_nome
            FROM pedidos p
            LEFT JOIN usuarios u ON p.id_usuario_cliente = u.id_usuario
            LEFT JOIN formas_pagamento fp ON p.id_forma_pagamento = fp.id_forma_pagamento
            WHERE p.id_restaurante = ? ORDER BY p.data_pedido DESC
        `;
        const pedidos = await new Promise((resolve, reject) => {
            db.all(sqlPedidos, [restaurante.id_restaurante], (err, rows) => err ? reject(err) : resolve(rows));
        });

        if (pedidos.length === 0) {
            return res.status(200).json([]);
        }

        const idsPedidos = pedidos.map(p => p.id_pedido);
        const placeholders = idsPedidos.map(() => '?').join(',');
        
        // ✅ AQUI ESTÁ A CORREÇÃO PRINCIPAL
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
    // Implementação para o restaurante atualizar o status...
};

exports.contarPedidosNaoFinalizados = async (req, res) => {
    // Implementação para o restaurante contar os pedidos...
};

// --- EXPORTAÇÃO FINAL E COMPLETA ---
module.exports = {
    criarPedido: exports.criarPedido,
    listarMeusPedidos: exports.listarMeusPedidos,
    avaliarPedido: exports.avaliarPedido,
    listarPedidosRestaurante: exports.listarPedidosRestaurante,
    atualizarStatusPedido: exports.atualizarStatusPedido,
    contarPedidosNaoFinalizados: exports.contarPedidosNaoFinalizados
};