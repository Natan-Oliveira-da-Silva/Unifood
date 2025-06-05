// backend/controllers/restaurante.controller.js
const db = require('../database/db');
const fs = require('fs'); // Módulo de sistema de arquivos para deletar imagem antiga
const path = require('path'); // Módulo path para lidar com caminhos de arquivo

// <<< FUNÇÃO QUE ESTAVA FALTANDO >>>
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


// --- CRIAR UM NOVO RESTAURANTE ---
exports.criarRestaurante = async (req, res) => {
    let url_imagem_logo = null;
    if (req.file) {
        url_imagem_logo = `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, "/")}`;
    }

    const { nome, id_cozinha, taxa_frete, endereco_cep, endereco_logradouro, endereco_numero, endereco_complemento, endereco_bairro, endereco_cidade, endereco_estado } = req.body;
    const id_usuario_responsavel = req.usuarioDecodificado.id_usuario;

    if (!nome || !id_cozinha) { return res.status(400).json({ message: "Nome e Tipo de Cozinha são obrigatórios." }); }
    
    try {
        const existingRestaurant = await new Promise((resolve, reject) => {
            db.get("SELECT id_restaurante FROM restaurantes WHERE id_usuario_responsavel = ?", [id_usuario_responsavel], (err, row) => {
                if (err) { reject(new Error("Erro ao verificar restaurante existente.")); }
                resolve(row);
            });
        });
        if (existingRestaurant) {
            if (req.file) { fs.unlinkSync(req.file.path); }
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
            nome, Number(id_cozinha), Number(taxa_frete) || 0.0, url_imagem_logo, id_usuario_responsavel,
            endereco_cep || null, endereco_logradouro || null, endereco_numero || null, endereco_complemento || null,
            endereco_bairro || null, endereco_cidade || null, endereco_estado || null
        ];
        db.run(sql, params, function (err) {
            if (err) {
                if (req.file) { fs.unlinkSync(req.file.path); }
                return res.status(500).json({ message: "Erro interno ao cadastrar o restaurante.", error: err.message });
            }
            res.status(201).json({ message: "Restaurante cadastrado com sucesso!", id_restaurante: this.lastID });
        });
    } catch(error) {
        if (req.file) { fs.unlinkSync(req.file.path); }
        res.status(500).json({ message: "Erro interno no servidor ao criar restaurante.", error: error.message });
    }
};

// --- ATUALIZAR DADOS DO "MEU RESTAURANTE" ---
exports.atualizarMeuRestaurante = async (req, res) => {
    const id_usuario_responsavel = req.usuarioDecodificado.id_usuario;
    const { nome, id_cozinha, taxa_frete, endereco_cep, endereco_logradouro, endereco_numero, endereco_complemento, endereco_bairro, endereco_cidade, endereco_estado } = req.body;
    
    try {
        const restauranteDoUsuario = await new Promise((resolve, reject) => {
            db.get("SELECT id_restaurante, url_imagem_logo FROM restaurantes WHERE id_usuario_responsavel = ?", [id_usuario_responsavel], (err, row) => {
                if (err) return reject(new Error("Erro ao verificar restaurante."));
                resolve(row);
            });
        });
        if (!restauranteDoUsuario) {
            if (req.file) { fs.unlinkSync(req.file.path); }
            return res.status(404).json({ message: "Nenhum restaurante encontrado para atualizar." });
        }

        let camposParaAtualizar = [];
        let valoresParaAtualizar = [];

        if (req.file) {
            const novaUrlImagemLogo = `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, "/")}`;
            camposParaAtualizar.push("url_imagem_logo = ?");
            valoresParaAtualizar.push(novaUrlImagemLogo);

            if (restauranteDoUsuario.url_imagem_logo) {
                try {
                    const nomeArquivoAntigo = path.basename(new URL(restauranteDoUsuario.url_imagem_logo).pathname);
                    const caminhoArquivoAntigo = path.join(__dirname, '../../uploads/restaurantes', nomeArquivoAntigo);
                    if(fs.existsSync(caminhoArquivoAntigo)) {
                        fs.unlinkSync(caminhoArquivoAntigo);
                    }
                } catch (e) { console.error("Erro ao deletar imagem antiga (URL inválida?):", e.message); }
            }
        }
        
        const addCampo = (nomeCampo, valor, isNumeric = false) => {
            if (valor !== undefined) {
                camposParaAtualizar.push(`${nomeCampo} = ?`);
                if (isNumeric && valor !== null && valor !== '') { valoresParaAtualizar.push(Number(valor)); } 
                else { valoresParaAtualizar.push(valor === '' ? null : valor); }
            }
        };
        addCampo("nome", nome); addCampo("id_cozinha", id_cozinha, true); addCampo("taxa_frete", taxa_frete, true);
        addCampo("endereco_cep", endereco_cep); addCampo("endereco_logradouro", endereco_logradouro);
        addCampo("endereco_numero", endereco_numero); addCampo("endereco_complemento", endereco_complemento);
        addCampo("endereco_bairro", endereco_bairro); addCampo("endereco_cidade", endereco_cidade);
        addCampo("endereco_estado", endereco_estado);

        if (camposParaAtualizar.length > 0) {
            camposParaAtualizar.push("data_atualizacao = CURRENT_TIMESTAMP");
            const sqlUpdate = `UPDATE restaurantes SET ${camposParaAtualizar.join(", ")} WHERE id_restaurante = ?`;
            valoresParaAtualizar.push(restauranteDoUsuario.id_restaurante);
            
            db.run(sqlUpdate, valoresParaAtualizar, function (err) {
                 if (err) { return res.status(500).json({ message: "Erro interno ao atualizar o restaurante.", error: err.message }); }
                const sqlSelectUpdated = `SELECT r.*, c.nome AS nome_cozinha FROM restaurantes r LEFT JOIN cozinhas c ON r.id_cozinha = c.id_cozinha WHERE r.id_restaurante = ?`;
                db.get(sqlSelectUpdated, [restauranteDoUsuario.id_restaurante], (errSelect, updatedRow) => {
                    if (errSelect) { return res.status(200).json({ message: "Restaurante atualizado, mas erro ao buscar dados atualizados." }); }
                    res.status(200).json({ message: "Restaurante atualizado com sucesso!", restaurante: updatedRow });
                });
            });
        } else {
            // Se nenhuma informação de texto foi enviada mas uma imagem foi, a imagem já foi salva.
            // Então, buscamos os dados atualizados (com a nova imagem) para retornar.
            const sqlSelectUpdated = `SELECT r.*, c.nome AS nome_cozinha FROM restaurantes r LEFT JOIN cozinhas c ON r.id_cozinha = c.id_cozinha WHERE r.id_restaurante = ?`;
            db.get(sqlSelectUpdated, [restauranteDoUsuario.id_restaurante], (errSelect, updatedRow) => {
                 if (errSelect) { return res.status(200).json({ message: "Imagem do restaurante atualizada, mas erro ao buscar dados." }); }
                res.status(200).json({ message: "Imagem do restaurante atualizada com sucesso!", restaurante: updatedRow });
            });
        }
    } catch (error) {
        if (req.file) { fs.unlinkSync(req.file.path); }
        res.status(500).json({ message: "Erro interno no servidor ao atualizar.", error: error.message });
    }
};

// --- APAGAR O "MEU RESTAURANTE" ---
exports.apagarMeuRestaurante = async (req, res) => {
    // ... (código completo da função apagarMeuRestaurante como já te enviei)
    const id_usuario_responsavel = req.usuarioDecodificado.id_usuario;
    try {
        const restauranteDoUsuario = await new Promise((resolve, reject) => {
            db.get("SELECT id_restaurante, url_imagem_logo FROM restaurantes WHERE id_usuario_responsavel = ?", [id_usuario_responsavel], (err, row) => {
                if (err) { return reject(new Error("Erro interno ao verificar dados do restaurante.")); }
                resolve(row);
            });
        });
        if (!restauranteDoUsuario) {
            return res.status(404).json({ message: "Nenhum restaurante encontrado para este usuário para apagar." });
        }
        
        // Deleta o arquivo de imagem associado antes de deletar o restaurante
        if (restauranteDoUsuario.url_imagem_logo) {
            try {
                const nomeArquivoAntigo = path.basename(new URL(restauranteDoUsuario.url_imagem_logo).pathname);
                const caminhoArquivoAntigo = path.join(__dirname, '../../uploads/restaurantes', nomeArquivoAntigo);
                if(fs.existsSync(caminhoArquivoAntigo)) {
                    fs.unlinkSync(caminhoArquivoAntigo);
                }
            } catch (e) { console.error("Erro ao deletar imagem antiga na exclusão do restaurante:", e.message); }
        }

        const sqlDelete = "DELETE FROM restaurantes WHERE id_restaurante = ?";
        db.run(sqlDelete, [restauranteDoUsuario.id_restaurante], function (err) {
            if (err) { return res.status(500).json({ message: "Erro interno ao apagar o restaurante.", error: err.message }); }
            res.status(200).json({ message: "Restaurante apagado com sucesso." });
        });
    } catch (error) {
        res.status(500).json({ message: "Erro interno no servidor ao tentar apagar restaurante." });
    }
};