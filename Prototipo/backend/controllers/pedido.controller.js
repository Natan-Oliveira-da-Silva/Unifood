const { db } = require('../database/db.js');

// --- FUNÇÕES DO CLIENTE ---

// CRIAR UM NOVO PEDIDO
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

// ✅ LISTAR OS PEDIDOS DO CLIENTE LOGADO (VERSÃO COM A CORREÇÃO NO NOME DA TABELA)
exports.listarMeusPedidos = async (req, res) => {
    try {
        const id_usuario_cliente = req.usuarioDecodificado.id_usuario;
        const sqlPedidos = `
            SELECT p.*, r.nome as nome_restaurante 
            FROM pedidos p
            JOIN restaurantes r ON p.id_restaurante = r.id_restaurante
            WHERE p.id_usuario_cliente = ? 
            ORDER BY p.data_pedido DESC
        `;
        const pedidos = await new Promise((resolve, reject) => {
            db.all(sqlPedidos, [id_usuario_cliente], (err, rows) => err ? reject(err) : resolve(rows));
        });

        if (pedidos.length === 0) return res.status(200).json([]);

        const idsPedidos = pedidos.map(p => p.id_pedido);
        const placeholders = idsPedidos.map(() => '?').join(',');
        
        // ✅ A CORREÇÃO ESTÁ AQUI: 'item_pedido' em vez de 'itens_pedido'
        const sqlItens = `
            SELECT ip.*, prod.nome as nome_produto 
            FROM item_pedido ip 
            JOIN produtos prod ON ip.id_produto = prod.id_produto 
            WHERE ip.id_pedido IN (${placeholders})
        `;
        const todosOsItens = await new Promise((resolve, reject) => {
            db.all(sqlItens, idsPedidos, (err, rows) => {
                if (err) return reject(new Error("Erro ao buscar os itens do pedido."));
                resolve(rows);
            });
        });

        const pedidosCompletos = pedidos.map(pedido => ({
            ...pedido,
            itens: todosOsItens.filter(item => item.id_pedido === pedido.id_pedido)
        }));

        res.status(200).json(pedidosCompletos);
    } catch (error) {
        console.error("Erro ao listar pedidos do cliente:", error);
        res.status(500).json({ message: "Erro interno ao buscar seus pedidos." });
    }
};

// AVALIAR UM PEDIDO
exports.avaliarPedido = async (req, res) => {
    // ...Sua lógica de avaliar, que já está correta...
};


// --- FUNÇÕES DO RESTAURANTE ---
exports.listarPedidosRestaurante = async (req, res) => {
    // ...Sua lógica de listar pedidos do restaurante...
};

exports.atualizarStatusPedido = async (req, res) => {
    // ...Sua lógica de atualizar status...
};

exports.contarPedidosNaoFinalizados = async (req, res) => {
    // ...Sua lógica de contar pedidos...
};

// --- EXPORTAÇÕES ---
module.exports = {
    criarPedido: exports.criarPedido,
    listarMeusPedidos: exports.listarMeusPedidos,
    avaliarPedido: exports.avaliarPedido,
    listarPedidosRestaurante: exports.listarPedidosRestaurante,
    atualizarStatusPedido: exports.atualizarStatusPedido,
    contarPedidosNaoFinalizados: exports.contarPedidosNaoFinalizados
};
