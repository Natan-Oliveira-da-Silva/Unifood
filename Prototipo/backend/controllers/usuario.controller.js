
const db = require('../database/db');
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.criarUsuario = async (req, res) => {
    
    const { nome_completo, email, senha, telefone, cpf } = req.body;

    // Validação básica: email e senha
    if (!email || !senha) {
        return res.status(400).json({ message: "Email e senha são obrigatórios." });
    }

    try {
        // Verificar se o email já existe
        const emailExists = await new Promise((resolve, reject) => {
            db.get("SELECT id_usuario FROM usuarios WHERE email = ?", [email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
        if (emailExists) {
            return res.status(409).json({ message: "Este email já está cadastrado." });
        }

        // Verificar se o CPF já existe
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

