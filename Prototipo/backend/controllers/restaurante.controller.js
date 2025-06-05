// backend/controllers/restaurante.controller.js
const db = require('../database/db');

// Buscar o restaurante do usuário logado
exports.getMeuRestaurante = async (req, res) => {
    const idUsuarioResponsavel = req.usuarioDecodificado.id_usuario;
    if (!idUsuarioResponsavel) {
        return res.status(400).json({ message: "ID do usuário não encontrado no token." });
    }
    const sql = `
        SELECT r.*, c.nome AS nome_cozinha 
        FROM restaurantes r
        LEFT JOIN cozinhas c ON r.id_cozinha = c.id_cozinha
        WHERE r.id_usuario_responsavel = ?
    `;
    try {
        const restaurante = await new Promise((resolve, reject) => {
            db.get(sql, [idUsuarioResponsavel], (err, row) => {
                if (err) {
                    console.error("Erro ao buscar restaurante do usuário:", err.message);
                    reject(new Error("Erro interno ao buscar dados do restaurante."));
                }
                resolve(row);
            });
        });
        if (!restaurante) {
            return res.status(404).json({ message: "Nenhum restaurante encontrado para este usuário." });
        }
        res.status(200).json(restaurante);
    } catch (error) {
        console.error("Erro no processo de buscar 'Meu Restaurante':", error.message);
        res.status(500).json({ message: error.message || "Erro interno no servidor ao buscar restaurante." });
    }
};

// CRIAR UM NOVO RESTAURANTE
exports.criarRestaurante = async (req, res) => {
    const id_usuario_responsavel = req.usuarioDecodificado.id_usuario;
    const {
        nome, id_cozinha, taxa_frete = 0.0, url_imagem_logo,
        endereco_cep, endereco_logradouro, endereco_numero, endereco_complemento,
        endereco_bairro, endereco_cidade, endereco_estado
    } = req.body;

    if (!nome || !id_cozinha) {
        return res.status(400).json({ message: "Nome e Tipo de Cozinha do restaurante são obrigatórios." });
    }

    try {
        const existingRestaurant = await new Promise((resolve, reject) => {
            db.get("SELECT id_restaurante FROM restaurantes WHERE id_usuario_responsavel = ?",
                [id_usuario_responsavel],
                (err, row) => {
                    if (err) { console.error("Erro ao verificar restaurante existente:", err.message); reject(new Error("Erro interno ao verificar dados do restaurante.")); }
                    resolve(row);
                });
        });
        if (existingRestaurant) {
            return res.status(409).json({ message: "Este usuário já possui um restaurante cadastrado." });
        }

        const sql = `
            INSERT INTO restaurantes (
                nome, id_cozinha, taxa_frete, url_imagem_logo, id_usuario_responsavel,
                endereco_cep, endereco_logradouro, endereco_numero, endereco_complemento,
                endereco_bairro, endereco_cidade, endereco_estado,
                ativo, aberto, data_cadastro, data_atualizacao
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        const params = [
            nome, Number(id_cozinha), Number(taxa_frete) || 0.0, url_imagem_logo || null, id_usuario_responsavel,
            endereco_cep || null, endereco_logradouro || null, endereco_numero || null, endereco_complemento || null,
            endereco_bairro || null, endereco_cidade || null, endereco_estado || null
        ];
        db.run(sql, params, function (err) {
            if (err) {
                console.error("Erro ao criar restaurante no banco:", err.message);
                if (err.message.includes("FOREIGN KEY constraint failed") && err.message.toLowerCase().includes("cozinhas")) {
                     return res.status(400).json({ message: "ID da cozinha inválido ou não encontrado." });
                }
                return res.status(500).json({ message: "Erro interno ao cadastrar o restaurante.", error: err.message });
            }
            res.status(201).json({
                message: "Restaurante cadastrado com sucesso!", id_restaurante: this.lastID,
                nome, id_cozinha, id_usuario_responsavel
            });
        });
    } catch (error) {
        console.error("Erro no processo de criação de restaurante (controller catch):", error.message);
        if (error.message === "Erro interno ao verificar dados do restaurante.") {
             return res.status(500).json({ message: error.message });
        }
        res.status(500).json({ message: "Erro interno no servidor ao criar restaurante." });
    }
};

// ATUALIZAR DADOS DO "MEU RESTAURANTE"
exports.atualizarMeuRestaurante = async (req, res) => {
    const id_usuario_responsavel = req.usuarioDecodificado.id_usuario;
    const { nome, id_cozinha, taxa_frete, url_imagem_logo, endereco_cep, endereco_logradouro, endereco_numero, endereco_complemento, endereco_bairro, endereco_cidade, endereco_estado } = req.body;

    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Nenhum dado fornecido para atualização." });
    }
    // Adicione validações para cada campo que pode ser atualizado, se necessário

    try {
        const restauranteDoUsuario = await new Promise((resolve, reject) => {
            db.get("SELECT id_restaurante FROM restaurantes WHERE id_usuario_responsavel = ?",
                [id_usuario_responsavel],
                (err, row) => {
                    if (err) { console.error("Erro ao buscar restaurante para atualização:", err.message); return reject(new Error("Erro interno ao verificar restaurante.")); }
                    resolve(row);
                });
        });

        if (!restauranteDoUsuario) {
            return res.status(404).json({ message: "Nenhum restaurante encontrado para este usuário para atualizar." });
        }
        const id_restaurante = restauranteDoUsuario.id_restaurante;

        let camposParaAtualizar = [];
        let valoresParaAtualizar = [];
        const addCampo = (nomeCampo, valor, isNumeric = false) => {
            if (valor !== undefined) {
                camposParaAtualizar.push(`${nomeCampo} = ?`);
                if (isNumeric && valor !== null && valor !== '') {
                    valoresParaAtualizar.push(Number(valor));
                } else { valoresParaAtualizar.push(valor === '' ? null : valor); }
            }
        };
        addCampo("nome", nome);
        addCampo("id_cozinha", id_cozinha, true);
        addCampo("taxa_frete", taxa_frete, true);
        addCampo("url_imagem_logo", url_imagem_logo);
        addCampo("endereco_cep", endereco_cep);
        addCampo("endereco_logradouro", endereco_logradouro);
        addCampo("endereco_numero", endereco_numero);
        addCampo("endereco_complemento", endereco_complemento);
        addCampo("endereco_bairro", endereco_bairro);
        addCampo("endereco_cidade", endereco_cidade);
        addCampo("endereco_estado", endereco_estado);
        // Adicione aqui outros campos atualizáveis como 'aberto', 'ativo', etc.

        if (camposParaAtualizar.length === 0) {
            return res.status(400).json({ message: "Nenhum campo válido fornecido para atualização." });
        }
        camposParaAtualizar.push("data_atualizacao = CURRENT_TIMESTAMP");

        const sqlUpdate = `UPDATE restaurantes SET ${camposParaAtualizar.join(", ")} WHERE id_restaurante = ?`;
        valoresParaAtualizar.push(id_restaurante);

        db.run(sqlUpdate, valoresParaAtualizar, function (err) {
            if (err) {
                console.error("Erro ao atualizar restaurante no banco:", err.message);
                if (err.message.includes("FOREIGN KEY constraint failed") && err.message.toLowerCase().includes("cozinhas")) {
                     return res.status(400).json({ message: "ID da cozinha inválido ou não encontrado." });
                }
                return res.status(500).json({ message: "Erro interno ao atualizar o restaurante.", error: err.message });
            }
            if (this.changes === 0) { return res.status(404).json({ message: "Restaurante não encontrado ou nenhum dado alterado." }); }
            
            const sqlSelectUpdated = `SELECT r.*, c.nome AS nome_cozinha FROM restaurantes r LEFT JOIN cozinhas c ON r.id_cozinha = c.id_cozinha WHERE r.id_restaurante = ?`;
            db.get(sqlSelectUpdated, [id_restaurante], (errSelect, updatedRow) => {
                if (errSelect) { return res.status(200).json({ message: "Restaurante atualizado, mas erro ao buscar dados atualizados." }); }
                res.status(200).json({ message: "Restaurante atualizado com sucesso!", restaurante: updatedRow });
            });
        });
    } catch (error) {
        console.error("Erro no processo de atualização de restaurante (controller catch):", error.message);
        if (error.message === "Erro interno ao verificar restaurante.") { return res.status(500).json({ message: error.message });}
        res.status(500).json({ message: "Erro interno no servidor ao tentar atualizar restaurante." });
    }
};

// --- APAGAR O "MEU RESTAURANTE" ---
exports.apagarMeuRestaurante = async (req, res) => {
    const id_usuario_responsavel = req.usuarioDecodificado.id_usuario;

    try {
        const restauranteDoUsuario = await new Promise((resolve, reject) => {
            db.get("SELECT id_restaurante FROM restaurantes WHERE id_usuario_responsavel = ?",
                [id_usuario_responsavel],
                (err, row) => {
                    if (err) {
                        console.error("Erro ao buscar restaurante do usuário para exclusão:", err.message);
                        return reject(new Error("Erro interno ao verificar dados do restaurante."));
                    }
                    resolve(row);
                });
        });

        if (!restauranteDoUsuario) {
            return res.status(404).json({ message: "Nenhum restaurante encontrado para este usuário para apagar." });
        }

        const id_restaurante_a_deletar = restauranteDoUsuario.id_restaurante;
        
        

        const sqlDelete = "DELETE FROM restaurantes WHERE id_restaurante = ?";
        db.run(sqlDelete, [id_restaurante_a_deletar], function (err) {
            if (err) {
                console.error("Erro ao apagar restaurante:", err.message);
                return res.status(500).json({ message: "Erro interno ao apagar o restaurante.", error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: "Restaurante não encontrado para apagar (verifique o ID)." });
            }
            res.status(200).json({ message: "Restaurante apagado com sucesso." });
            // Ou res.status(204).send();
        });

    } catch (error) {
        console.error("Erro no processo de exclusão de restaurante:", error.message);
        if (error.message === "Erro interno ao verificar dados do restaurante." || error.message === "Erro ao deletar produtos associados.") {
            return res.status(500).json({ message: error.message });
        }
        res.status(500).json({ message: "Erro interno no servidor ao tentar apagar restaurante." });
    }
};