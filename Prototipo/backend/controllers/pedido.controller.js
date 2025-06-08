// backend/controllers/pedido.controller.js
const { db } = require('../database/db.js');

// --- CRIAR UM NOVO PEDIDO (REQUER AUTENTICAÇÃO DE CLIENTE) ---
exports.criarPedido = async (req, res) => {
    const id_usuario_cliente = req.usuarioDecodificado.id_usuario;
    const { id_restaurante, id_forma_pagamento, itens, observacao } = req.body;

    if (!id_restaurante || !id_forma_pagamento || !itens || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ message: "Dados do pedido incompletos ou inválidos." });
    }

    try {
        // --- Inicia a Transação ---
        await new Promise((resolve, reject) => {
            db.run("BEGIN TRANSACTION;", (err) => err ? reject(err) : resolve());
        });

        // 1. Busca os preços de todos os produtos do carrinho de uma só vez
        const idsProdutos = itens.map(i => i.id_produto);
        const placeholders = idsProdutos.map(() => '?').join(',');
        const sqlPrecos = `SELECT id_produto, preco FROM produtos WHERE id_produto IN (${placeholders})`;
        
        const produtosDoBanco = await new Promise((resolve, reject) => {
            db.all(sqlPrecos, idsProdutos, (err, rows) => {
                if (err) reject(new Error("Erro ao validar produtos."));
                // Garante que todos os produtos solicitados foram encontrados
                if (rows.length !== idsProdutos.length) {
                    reject(new Error("Um ou mais produtos no carrinho são inválidos ou não existem."));
                }
                resolve(rows);
            });
        });

        // 2. Calcula o valor total no backend para garantir a segurança
        let valor_total = 0;
        const mapaDePrecos = new Map(produtosDoBanco.map(p => [p.id_produto, p.preco]));
        
        itens.forEach(item => {
            const precoDoBanco = mapaDePrecos.get(item.id_produto);
            valor_total += precoDoBanco * item.quantidade;
        });

        // 3. Insere o registro principal na tabela 'pedidos'
        const sqlPedido = `INSERT INTO pedidos (id_usuario_cliente, id_restaurante, id_forma_pagamento, valor_total, observacao) VALUES (?, ?, ?, ?, ?)`;
        const { lastID: id_pedido } = await new Promise((resolve, reject) => {
            db.run(sqlPedido, [id_usuario_cliente, id_restaurante, id_forma_pagamento, valor_total, observacao], function(err) {
                if (err) reject(new Error("Não foi possível registrar o pedido."));
                resolve(this);
            });
        });

        // 4. Insere cada item do pedido na tabela 'item_pedido'
        const sqlItem = `INSERT INTO item_pedido (id_pedido, id_produto, quantidade, preco_unitario) VALUES (?, ?, ?, ?)`;
        const stmt = db.prepare(sqlItem);
        for (const item of itens) {
            const precoDoBanco = mapaDePrecos.get(item.id_produto);
            await new Promise((resolve, reject) => {
                stmt.run([id_pedido, item.id_produto, item.quantidade, precoDoBanco], (err) => {
                    if(err) reject(new Error("Não foi possível registrar um item do pedido."));
                    resolve();
                });
            });
        }
        stmt.finalize();

        // --- Confirma a Transação ---
        await new Promise((resolve, reject) => {
            db.run("COMMIT;", (err) => err ? reject(err) : resolve());
        });

        res.status(201).json({ message: "Pedido realizado com sucesso!", id_pedido: id_pedido });

    } catch (error) {
        // --- Desfaz a Transação em caso de erro ---
        await new Promise((resolve, reject) => {
            db.run("ROLLBACK;", (err) => err ? reject(err) : resolve());
        });
        console.error("Erro na transação ao criar pedido:", error.message);
        res.status(500).json({ message: error.message || "Ocorreu um erro ao processar seu pedido." });
    }
};


// --- LISTAR PEDIDOS DE UM CLIENTE ---
exports.listarMeusPedidos = (req, res) => {
    const id_usuario_cliente = req.usuarioDecodificado.id_usuario;
    const sql = `SELECT * FROM pedidos WHERE id_usuario_cliente = ? ORDER BY data_pedido DESC`;
    
    db.all(sql, [id_usuario_cliente], (err, rows) => {
        if(err) return res.status(500).json({ message: "Erro ao buscar pedidos." });
        res.status(200).json(rows);
    });
};

// --- EXPORTAÇÃO ---
module.exports = {
    criarPedido: exports.criarPedido,
    listarMeusPedidos: exports.listarMeusPedidos
};