const { db } = require('../database/db.js');

// --- FUNÇÕES DO CLIENTE ---
// (As suas funções de cliente que já estavam corretas permanecem aqui)
exports.criarPedido = async (req, res) => { /* ...código existente... */ };
exports.listarMeusPedidos = async (req, res) => { /* ...código existente... */ };
exports.avaliarPedido = async (req, res) => { /* ...código existente... */ };

// --- FUNÇÕES DO RESTAURANTE ---

// ✅ LISTAR PEDIDOS RECEBIDOS PELO RESTAURANTE (VERSÃO FINAL E MAIS ROBUSTA)
exports.listarPedidosRestaurante = async (req, res) => {
    try {
        const idUsuarioLogado = req.usuarioDecodificado.id_usuario;

        // 1. Acha o restaurante do usuário logado
        const restaurante = await new Promise((resolve, reject) => {
            db.get("SELECT id_restaurante FROM restaurantes WHERE id_usuario_responsavel = ?", [idUsuarioLogado], (err, row) => {
                if (err || !row) return reject(new Error("Restaurante não encontrado para este usuário."));
                resolve(row);
            });
        });

        // 2. Busca os pedidos principais, juntando dados de outras tabelas com LEFT JOIN para ser mais seguro
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

        // 3. Busca todos os itens de todos os pedidos de uma só vez (muito eficiente)
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
        
        // 4. "Encaixa" os itens nos seus respectivos pedidos
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

// ATUALIZAR STATUS DE UM PEDIDO
exports.atualizarStatusPedido = async (req, res) => {
    // ...Sua lógica de atualizar status, que já está correta...
};

// CONTAR PEDIDOS NÃO FINALIZADOS
exports.contarPedidosNaoFinalizados = async (req, res) => {
    // ...Sua lógica de contar pedidos, que já está correta...
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
