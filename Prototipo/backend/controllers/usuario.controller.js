// backend/controllers/usuario.controller.js
const db = require('../database/db');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// --- CRIAR NOVO USUÁRIO (Cadastro) ---
exports.criarUsuario = async (req, res) => {
    const { nome_completo, email, senha, telefone, cpf } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: "Email e senha são obrigatórios." });
    }

    try {
        const emailExists = await new Promise((resolve, reject) => {
            db.get("SELECT id_usuario FROM usuarios WHERE email = ?", [email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
        if (emailExists) {
            return res.status(409).json({ message: "Este email já está cadastrado." });
        }

        if (cpf) {
            const cpfExists = await new Promise((resolve, reject) => {
                db.get("SELECT id_usuario FROM usuarios WHERE cpf = ?", [cpf], (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                });
            });
            if (cpfExists) {
                return res.status(409).json({ message: "Este CPF já está cadastrado." });
            }
        }

        const senha_hash = await bcrypt.hash(senha, saltRounds);
        const sql = `
            INSERT INTO usuarios (nome_completo, email, senha_hash, telefone, cpf, ativo)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [
            nome_completo || null,
            email,
            senha_hash,
            telefone || null,
            cpf || null,
            1
        ];

        db.run(sql, params, function (err) {
            if (err) {
                console.error("Erro ao criar usuário:", err.message);
                return res.status(500).json({ message: "Erro interno ao criar usuário.", error: err.message });
            }
            res.status(201).json({
                message: "Usuário criado com sucesso!",
                id_usuario: this.lastID,
                email: email,
                nome_completo: nome_completo || null
            });
        });
    } catch (error) {
        console.error("Erro no processo de criação de usuário:", error.message);
        res.status(500).json({ message: "Erro interno no servidor.", error: error.message });
    }
};

// --- LISTAR TODOS OS USUÁRIOS ---
exports.listarUsuarios = (req, res) => {
    const sql = "SELECT id_usuario, nome_completo, email, telefone, cpf, ativo, data_cadastro FROM usuarios";
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Erro ao listar usuários:", err.message);
            return res.status(500).json({ message: "Erro interno ao buscar usuários.", error: err.message });
        }
        res.status(200).json(rows);
    });
};

// --- OBTER UM USUÁRIO PELO ID ---
exports.obterUsuarioPorId = (req, res) => {
    const { id } = req.params;
    const sql = "SELECT id_usuario, nome_completo, email, telefone, cpf, ativo, data_cadastro FROM usuarios WHERE id_usuario = ?";

    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error("Erro ao buscar usuário:", err.message);
            return res.status(500).json({ message: "Erro interno ao buscar usuário.", error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }
        res.status(200).json(row);
    });
};

// --- ATUALIZAR UM USUÁRIO ---
exports.atualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nome_completo, telefone, cpf, ativo } = req.body; // Não permitir alterar email ou senha aqui diretamente

    // Verifica se pelo menos um campo foi fornecido para atualização
    if (nome_completo === undefined && telefone === undefined && cpf === undefined && ativo === undefined) {
        return res.status(400).json({ message: "Nenhum dado fornecido para atualização." });
    }

    let fieldsToUpdate = [];
    let params = [];

    if (nome_completo !== undefined) {
        fieldsToUpdate.push("nome_completo = ?");
        params.push(nome_completo);
    }
    if (telefone !== undefined) {
        fieldsToUpdate.push("telefone = ?");
        params.push(telefone);
    }
    if (cpf !== undefined) {
        try { // Adicionado try-catch para a verificação de CPF
            const cpfExists = await new Promise((resolve, reject) => {
                db.get("SELECT id_usuario FROM usuarios WHERE cpf = ? AND id_usuario != ?", [cpf, id], (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                });
            });
            if (cpfExists) {
                return res.status(409).json({ message: "Este CPF já está cadastrado para outro usuário." });
            }
            fieldsToUpdate.push("cpf = ?");
            params.push(cpf);
        } catch(error) {
            console.error("Erro ao verificar CPF para atualização:", error.message);
            return res.status(500).json({ message: "Erro interno ao verificar CPF.", error: error.message });
        }
    }
    if (ativo !== undefined) {
        fieldsToUpdate.push("ativo = ?");
        params.push(ativo ? 1 : 0);
    }

    if (fieldsToUpdate.length === 0) {
        // Esta verificação pode ser redundante devido à primeira, mas é uma segurança extra.
        return res.status(400).json({ message: "Nenhum campo válido para atualização fornecido." });
    }

    const sql = `UPDATE usuarios SET ${fieldsToUpdate.join(", ")} WHERE id_usuario = ?`;
    params.push(id);

    db.run(sql, params, function (err) {
        if (err) {
            console.error("Erro ao atualizar usuário:", err.message);
            return res.status(500).json({ message: "Erro interno ao atualizar usuário.", error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: "Usuário não encontrado para atualização." });
        }
        res.status(200).json({ message: "Usuário atualizado com sucesso!", changes: this.changes });
    });
};


// --- DELETAR UM USUÁRIO (Marca como inativo) ---
exports.deletarUsuario = (req, res) => {
    const { id } = req.params;
    const sql = "UPDATE usuarios SET ativo = 0 WHERE id_usuario = ?"; // Deleção lógica

    db.run(sql, [id], function (err) {
        if (err) {
            console.error("Erro ao 'deletar' usuário:", err.message);
            return res.status(500).json({ message: "Erro interno ao desativar usuário.", error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }
        res.status(200).json({ message: "Usuário desativado com sucesso." });
    });
};