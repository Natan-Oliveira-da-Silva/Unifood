const { db } = require('../database/db.js');

// --- LISTAR TODOS OS RESTAURANTES (PÚBLICO) ---
exports.listarRestaurantes = (req, res) => {
    const sql = `
        SELECT r.id_restaurante, r.nome, r.taxa_frete, r.nota_avaliacao, r.url_imagem_logo, c.nome AS nome_cozinha
        FROM restaurantes r
        LEFT JOIN cozinhas c ON r.id_cozinha = c.id_cozinha
        WHERE r.ativo = 1 ORDER BY r.nota_avaliacao DESC, r.nome ASC`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Erro ao listar restaurantes:", err);
            return res.status(500).json({ message: "Erro interno ao buscar restaurantes." });
        }
        res.status(200).json(rows);
    });
};

// --- BUSCAR DADOS DO RESTAURANTE DO USUÁRIO LOGADO ---
exports.buscarMeuRestaurante = async (req, res) => {
    // O middleware de autenticação deve adicionar o objeto do usuário em req.usuarioDecodificado
    const idUsuarioResponsavel = req.usuarioDecodificado.id_usuario;
    const sql = `SELECT * FROM restaurantes WHERE id_usuario_responsavel = ?`;

    try {
        const restaurante = await new Promise((resolve, reject) => {
            db.get(sql, [idUsuarioResponsavel], (err, row) => {
                if (err) return reject(new Error("Erro de banco de dados ao buscar seu restaurante."));
                resolve(row);
            });
        });

        if (!restaurante) {
            return res.status(404).json({ message: "Nenhum perfil de restaurante encontrado para este usuário." });
        }
        res.status(200).json(restaurante);

    } catch (error) {
        console.error("Erro ao buscar meu restaurante:", error);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
};

// --- CRIAR UM NOVO PERFIL DE RESTAURANTE ---
exports.criarRestaurante = async (req, res) => {
    try {
        const {
            nome, taxa_frete, id_cozinha, endereco_cep, endereco_logradouro,
            endereco_numero, endereco_complemento, endereco_bairro,
            endereco_cidade, endereco_estado,
        } = req.body;

        const idUsuarioResponsavel = req.usuarioDecodificado.id_usuario;

        if (!nome || !id_cozinha) {
            return res.status(400).json({ message: "Nome e tipo de cozinha são obrigatórios." });
        }

        const restauranteExistente = await new Promise((resolve, reject) => {
            db.get("SELECT id_restaurante FROM restaurantes WHERE id_usuario_responsavel = ?", [idUsuarioResponsavel], (err, row) => {
                if (err) return reject(new Error("Erro ao verificar restaurante existente."));
                resolve(row);
            });
        });

        if (restauranteExistente) {
            return res.status(409).json({ message: "Este usuário já possui um restaurante cadastrado." });
        }

        // PONTO DE ATENÇÃO: Verifique se o caminho do upload está correto!
        const urlImagemLogo = req.file ? `/uploads/${req.file.filename}` : null;

        const sql = `
            INSERT INTO restaurantes (
                nome, taxa_frete, id_cozinha, url_imagem_logo, id_usuario_responsavel,
                endereco_cep, endereco_logradouro, endereco_numero, endereco_complemento,
                endereco_bairro, endereco_cidade, endereco_estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            nome, parseFloat(taxa_frete) || 0, parseInt(id_cozinha),
            urlImagemLogo, idUsuarioResponsavel, endereco_cep, endereco_logradouro,
            endereco_numero, endereco_complemento, endereco_bairro,
            endereco_cidade, endereco_estado
        ];

        db.run(sql, params, function (err) {
            if (err) {
                console.error("Erro ao criar restaurante:", err);
                return res.status(500).json({ message: "Erro ao criar restaurante." });
            }
            res.status(201).json({ message: "Restaurante criado com sucesso!", id_restaurante: this.lastID });
        });

    } catch (error) {
        console.error("Catch geral ao criar restaurante:", error);
        res.status(500).json({ message: "Erro interno inesperado ao criar o restaurante." });
    }
};

// --- BUSCAR UM RESTAURANTE ESPECÍFICO PELO ID (PÚBLICO) ---
exports.buscarRestaurantePorId = async (req, res) => {
    try {
        const idRestaurante = req.params.id;
        const sql = `
            SELECT r.id_restaurante, r.nome, r.taxa_frete, r.nota_avaliacao, r.url_imagem_logo, c.nome AS nome_cozinha
            FROM restaurantes r
            LEFT JOIN cozinhas c ON r.id_cozinha = c.id_cozinha
            WHERE r.id_restaurante = ? AND r.ativo = 1`;

        const restaurante = await new Promise((resolve, reject) => {
            db.get(sql, [idRestaurante], (err, row) => {
                if (err) return reject(new Error("Erro de banco de dados ao buscar o restaurante."));
                resolve(row);
            });
        });

        if (!restaurante) {
            return res.status(404).json({ message: "Restaurante não encontrado ou inativo." });
        }

        res.status(200).json(restaurante);

    } catch (error) {
        console.error("Erro ao buscar restaurante por ID:", error);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
};

// --- ATUALIZAR O PERFIL DO RESTAURANTE LOGADO ---
exports.atualizarRestaurante = async (req, res) => {
    try {
        const idUsuarioResponsavel = req.usuarioDecodificado.id_usuario;

        // Primeiro, garante que o restaurante pertence ao usuário
        const restaurante = await new Promise((resolve, reject) => {
            db.get("SELECT id_restaurante FROM restaurantes WHERE id_usuario_responsavel = ?", [idUsuarioResponsavel], (err, row) => {
                if (err) return reject(new Error("Erro ao localizar seu restaurante."));
                if (!row) return reject(new Error("Restaurante não encontrado para este usuário."));
                resolve(row);
            });
        });

        // Pega os dados do corpo da requisição
        const {
            nome, taxa_frete, id_cozinha, endereco_cep, endereco_logradouro,
            endereco_numero, endereco_complemento, endereco_bairro,
            endereco_cidade, endereco_estado,
        } = req.body;

        const queryParts = [];
        const params = [];

        // Monta a query dinamicamente apenas com os campos que foram enviados
        if (nome !== undefined) { queryParts.push("nome = ?"); params.push(nome); }
        if (taxa_frete !== undefined) { queryParts.push("taxa_frete = ?"); params.push(parseFloat(taxa_frete)); }
        if (id_cozinha !== undefined) { queryParts.push("id_cozinha = ?"); params.push(parseInt(id_cozinha)); }
        if (endereco_cep !== undefined) { queryParts.push("endereco_cep = ?"); params.push(endereco_cep); }
        if (endereco_logradouro !== undefined) { queryParts.push("endereco_logradouro = ?"); params.push(endereco_logradouro); }
        if (endereco_numero !== undefined) { queryParts.push("endereco_numero = ?"); params.push(endereco_numero); }
        if (endereco_complemento !== undefined) { queryParts.push("endereco_complemento = ?"); params.push(endereco_complemento); }
        if (endereco_bairro !== undefined) { queryParts.push("endereco_bairro = ?"); params.push(endereco_bairro); }
        if (endereco_cidade !== undefined) { queryParts.push("endereco_cidade = ?"); params.push(endereco_cidade); }
        if (endereco_estado !== undefined) { queryParts.push("endereco_estado = ?"); params.push(endereco_estado); }
        
        // Se uma nova imagem foi enviada, adiciona à query
        if (req.file) {
            queryParts.push("url_imagem_logo = ?");
            // PONTO DE ATENÇÃO: Verifique se o caminho do upload está correto!
            params.push(`/uploads/${req.file.filename}`);
        }

        if (queryParts.length === 0) {
            return res.status(400).json({ message: "Nenhum dado fornecido para atualização." });
        }

        // Adiciona o ID do restaurante no final dos parâmetros para o WHERE
        params.push(restaurante.id_restaurante);

        const sql = `UPDATE restaurantes SET ${queryParts.join(', ')} WHERE id_restaurante = ?`;

        db.run(sql, params, function (err) {
            if (err) {
                console.error("Erro ao atualizar o restaurante:", err);
                return res.status(500).json({ message: "Erro ao atualizar o restaurante." });
            }
            res.status(200).json({ message: "Restaurante atualizado com sucesso!" });
        });

    } catch (error) {
        console.error("Catch geral ao atualizar restaurante:", error);

        const statusCode = error.message.includes("não encontrado") ? 404 : 500;
        res.status(statusCode).json({ message: error.message });
    }
};


// --- APAGAR O RESTAURANTE DO USUÁRIO LOGADO ---
exports.apagarRestaurante = async (req, res) => {
    try {
        const idUsuarioResponsavel = req.usuarioDecodificado.id_usuario;

        // Primeiro, verificamos se o restaurante realmente existe para dar um feedback correto
        const restaurante = await new Promise((resolve, reject) => {
            db.get("SELECT id_restaurante FROM restaurantes WHERE id_usuario_responsavel = ?", [idUsuarioResponsavel], (err, row) => {
                if (err) return reject(new Error("Erro de banco de dados."));
                resolve(row);
            });
        });

        if (!restaurante) {
            return res.status(404).json({ message: "Nenhum restaurante encontrado para este usuário." });
        }

        // Se o restaurante existe, executamos o comando DELETE
        const sql = `DELETE FROM restaurantes WHERE id_usuario_responsavel = ?`;
        db.run(sql, [idUsuarioResponsavel], function(err) {
            if (err) {
                console.error("Erro ao apagar restaurante:", err);
                return res.status(500).json({ message: "Erro interno ao apagar o restaurante." });
            }
            // `this.changes` retorna o número de linhas afetadas. Se for > 0, funcionou.
            if (this.changes > 0) {
                res.status(200).json({ message: "Restaurante apagado com sucesso!" });
            } else {
                res.status(404).json({ message: "Nenhum restaurante foi apagado. Verifique os dados." });
            }
        });

    } catch (error) {
        console.error("Catch geral ao apagar restaurante:", error);
        res.status(500).json({ message: error.message || "Erro inesperado no servidor." });
    }
};

// --- EXPORTAÇÃO DE TODAS AS FUNÇÕES ---
module.exports = {
    listarRestaurantes: exports.listarRestaurantes,
    buscarMeuRestaurante: exports.buscarMeuRestaurante,
    criarRestaurante: exports.criarRestaurante,
    atualizarRestaurante: exports.atualizarRestaurante,
    buscarRestaurantePorId: exports.buscarRestaurantePorId,
    apagarRestaurante: exports.apagarRestaurante,
    
};