const { db } = require('../database/db.js');

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
            const sql = `INSERT INTO pedidos (id_usuario_cliente, id_restaurante, id_forma_pagamento, observacao, data_pedido, status, valor_total) VALUES (?, ?, ?, ?, ?, 'Recebido', ?)`;
            db.run(sql, [idUsuarioCliente, id_restaurante, id_forma_pagamento, observacao, dataPedido, valorTotal], function (err) {
                if (err) return reject(new Error("Erro ao inserir pedido no banco."));
                resolve(this.lastID);
            });
        });
        const sqlItem = `INSERT INTO item_pedido (id_pedido, id_produto, quantidade, preco_unitario) VALUES (?, ?, ?, ?)`;
        const promises = itens.map(item => new Promise((resolve, reject) => {
            db.run(sqlItem, [idPedido, item.id_produto, item.quantidade, item.preco], (err) => {
                if (err) return reject(new Error("Erro ao inserir item de pedido."));
                resolve();
            });
        }));
        await Promise.all(promises);
        res.status(201).json({ message: "Pedido criado com sucesso!", id_pedido: idPedido });
    } catch (error) {
        console.error("Erro ao criar pedido:", error.message);
        res.status(500).json({ message: "Erro ao processar o pedido." });
    }
};

exports.listarMeusPedidos = async (req, res) => {
    try {
        const idUsuarioCliente = req.usuarioDecodificado?.id_usuario;
        if (!idUsuarioCliente) {
            return res.status(401).json({ message: "Usuário não autenticado." });
        }

        const sql = `SELECT * FROM pedidos WHERE id_usuario_cliente = ? ORDER BY data_pedido DESC`;
        db.all(sql, [idUsuarioCliente], (err, rows) => {
            if (err) {
                console.error("Erro ao buscar pedidos:", err.message);
                return res.status(500).json({ message: "Erro ao buscar pedidos." });
            }

            res.status(200).json(rows);
        });
    } catch (error) {
        console.error("Erro inesperado:", error.message);
        res.status(500).json({ message: error.message });
    }
};

exports.avaliarPedido = async (req, res) => {
    res.status(501).json({ message: "Funcionalidade de avaliação ainda não implementada." });
};

exports.cancelarPedido = async (req, res) => {
    try {
        const idPedido = req.params.id_pedido;
        const idUsuario = req.usuarioDecodificado?.id_usuario;
        
        const motivo = req.body?.motivo;

        if (!motivo) {
            return res.status(400).json({ message: "Motivo do cancelamento é obrigatório." });
        }

        
        // Verifica se o pedido pertence ao cliente e está em status cancelável
        const pedido = await new Promise((resolve, reject) => {
            db.get(
                `SELECT status FROM pedidos WHERE id_pedido = ? AND id_usuario_cliente = ?`,
                [idPedido, idUsuario],
                (err, row) => {
                    if (err) return reject(new Error("Erro ao verificar pedido."));
                    if (!row) return reject(new Error("Pedido não encontrado ou não pertence ao usuário."));
                    resolve(row);
                }
            );
        });

        if (["Preparando", "A Caminho", "Entregue", "Finalizado", "Cancelado"].includes(pedido.status)) {
            return res.status(403).json({ message: `O pedido não pode ser cancelado pois está com status: "${pedido.status}".` });
        }

        // Atualiza status e salva motivo na observação
        const result = await new Promise((resolve, reject) => {
            const sql = `
                UPDATE pedidos 
                SET status = 'Cancelado', observacao = COALESCE(observacao, '') || ' | Cancelado: ' || ? 
                WHERE id_pedido = ? AND id_usuario_cliente = ?
            `;
            db.run(sql, [motivo, idPedido, idUsuario], function (err) {
                if (err) return reject(new Error("Erro ao cancelar pedido."));
                resolve({ changes: this.changes });
            });
        });

        if (result.changes === 0) {
            return res.status(404).json({ message: "Falha ao atualizar o pedido." });
        }

        res.status(200).json({ message: "Pedido cancelado com sucesso!" });

    } catch (error) {
        console.error("Erro ao cancelar pedido:", error.message);
        res.status(500).json({ message: error.message });
    }
};


exports.listarPedidosRestaurante = async (req, res) => {
    try {
        const idUsuarioLogado = req.usuarioDecodificado.id_usuario;

        const restaurante = await new Promise((resolve, reject) => {
            db.get("SELECT id_restaurante FROM restaurantes WHERE id_usuario_responsavel = ?", [idUsuarioLogado], (err, row) => {
                if (err) return reject(new Error("Erro de DB ao buscar restaurante."));
                if (!row) return reject(new Error("Restaurante não encontrado para este usuário."));
                resolve(row);
            });
        });

        const sqlPedidos = `
            SELECT 
                p.*, 
                u.nome_completo as nome_cliente,
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
    try {
        const { id_pedido } = req.params;
        const { status } = req.body;
        const idUsuario = req.usuarioDecodificado?.id_usuario;

        if (!status || !id_pedido) {
            return res.status(400).json({ message: "Dados insuficientes." });
        }

        // Verifica se o usuário é dono do restaurante relacionado ao pedido
        const permissaoRestaurante = await new Promise((resolve, reject) => {
            const sql = `
                SELECT r.id_restaurante
                FROM pedidos p
                JOIN restaurantes r ON p.id_restaurante = r.id_restaurante
                WHERE p.id_pedido = ? AND r.id_usuario_responsavel = ?
            `;
            db.get(sql, [id_pedido, idUsuario], (err, row) => {
                if (err) return reject(new Error("Erro ao verificar permissão de restaurante."));
                resolve(!!row); // true se encontrou
            });
        });

        // Verifica se o usuário é o cliente que fez o pedido
        const permissaoCliente = await new Promise((resolve, reject) => {
            db.get(
                "SELECT 1 FROM pedidos WHERE id_pedido = ? AND id_usuario_cliente = ?",
                [id_pedido, idUsuario],
                (err, row) => {
                    if (err) return reject(new Error("Erro ao verificar permissão de cliente."));
                    resolve(!!row);
                }
            );
        });

        if (!permissaoRestaurante && !permissaoCliente) {
            return res.status(403).json({ message: "Você não tem permissão para alterar esse pedido." });
        }

        const result = await new Promise((resolve, reject) => {
            db.run("UPDATE pedidos SET status = ? WHERE id_pedido = ?", [status, id_pedido], function (err) {
                if (err) return reject(new Error("Erro ao atualizar status do pedido."));
                resolve({ changes: this.changes });
            });
        });

        if (result.changes === 0) {
            return res.status(404).json({ message: "Pedido não encontrado." });
        }

        res.status(200).json({ message: "Status do pedido atualizado com sucesso!" });

    } catch (error) {
        console.error("Erro ao atualizar status:", error.message);
        res.status(500).json({ message: error.message });
    }
};


exports.contarPedidosNaoFinalizados = async (req, res) => {
    try {
        const idUsuarioLogado = req.usuarioDecodificado.id_usuario;
        const restaurante = await new Promise((resolve, reject) => {
            db.get("SELECT id_restaurante FROM restaurantes WHERE id_usuario_responsavel = ?", [idUsuarioLogado], (err, row) => {
                if (err) return reject(new Error("Erro ao localizar o restaurante."));
                if (!row) return reject(new Error("Restaurante não encontrado para este usuário."));
                resolve(row);
            });
        });
        const statusFinalizados = ['Entregue', 'Cancelado'];
        const sql = `SELECT COUNT(id_pedido) as contagem FROM pedidos WHERE id_restaurante = ? AND status NOT IN (${statusFinalizados.map(() => '?').join(',')})`;
        const params = [restaurante.id_restaurante, ...statusFinalizados];
        const resultado = await new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) return reject(new Error("Erro ao contar os pedidos."));
                resolve(row);
            });
        });
        res.status(200).json({ contagem: resultado.contagem || 0 });
    } catch (error) {
        console.error("Erro ao contar pedidos não finalizados:", error.message);
        res.status(500).json({ message: error.message });
    }
};