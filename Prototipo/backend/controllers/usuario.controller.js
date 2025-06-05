// backend/controllers/usuario.controller.js
const db = require('../database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Módulo nativo do Node.js para gerar tokens seguros
const { createTestTransporter } = require('../config/mailer.js'); // Nosso configurador de e-mail
const nodemailer = require('nodemailer'); // Para pegar a URL de preview do Ethereal

const saltRounds = 10;

// --- CRIAR NOVO USUÁRIO (Cadastro) ---
exports.criarUsuario = async (req, res) => {
    const { nome_completo, email, senha, telefone, cpf, tipo_usuario } = req.body;
    if (!email || !senha || !tipo_usuario) {
        return res.status(400).json({ message: "Email, senha e tipo de usuário são obrigatórios." });
    }
    if (tipo_usuario !== 'C' && tipo_usuario !== 'R') {
        return res.status(400).json({ message: "Tipo de usuário inválido. Use 'C' para cliente ou 'R' para restaurante." });
    }
    try {
        const emailExists = await new Promise((resolve, reject) => {
            db.get("SELECT id_usuario FROM usuarios WHERE email = ?", [email], (err, row) => {
                if (err) reject(new Error("Erro ao verificar email."));
                resolve(row);
            });
        });
        if (emailExists) {
            return res.status(409).json({ message: "Este email já está cadastrado." });
        }
        if (cpf) {
            const cpfExists = await new Promise((resolve, reject) => {
                db.get("SELECT id_usuario FROM usuarios WHERE cpf = ?", [cpf], (err, row) => {
                    if (err) reject(new Error("Erro ao verificar CPF."));
                    resolve(row);
                });
            });
            if (cpfExists) {
                return res.status(409).json({ message: "Este CPF já está cadastrado." });
            }
        }
        const senha_hash = await bcrypt.hash(senha, saltRounds);
        const sql = `INSERT INTO usuarios (nome_completo, email, senha_hash, telefone, cpf, tipo_usuario, ativo) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const params = [nome_completo || null, email, senha_hash, telefone || null, cpf || null, tipo_usuario, 1];
        db.run(sql, params, function (err) {
            if (err) {
                return res.status(500).json({ message: "Erro interno ao criar usuário.", error: err.message });
            }
            res.status(201).json({
                message: "Usuário criado com sucesso!",
                id_usuario: this.lastID, email, tipo_usuario
            });
        });
    } catch (error) {
        res.status(500).json({ message: "Erro interno no servidor ao criar usuário.", error: error.message });
    }
};

// --- LOGIN DE USUÁRIO ---
exports.loginUsuario = async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ message: "Email e senha são obrigatórios." });
    }
    const sql = "SELECT * FROM usuarios WHERE email = ?";
    try {
        const usuario = await new Promise((resolve, reject) => {
            db.get(sql, [email], (err, row) => {
                if (err) reject(new Error("Erro interno ao tentar fazer login."));
                resolve(row);
            });
        });
        if (!usuario) { return res.status(401).json({ message: "Credenciais inválidas. Usuário não encontrado." }); }
        if (usuario.ativo === 0) { return res.status(403).json({ message: "Usuário inativo. Entre em contato com o suporte." }); }
        
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaCorreta) { return res.status(401).json({ message: "Credenciais inválidas. Senha incorreta." }); }
        
        const JWT_SECRET = process.env.JWT_SECRET || "SEGREDO_MUITO_SECRETO_PARA_DESENVOLVIMENTO_12345";
        const payload = { id_usuario: usuario.id_usuario, email: usuario.email, nome_completo: usuario.nome_completo, tipo_usuario: usuario.tipo_usuario };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            message: "Login bem-sucedido!", token,
            usuario: { id_usuario: usuario.id_usuario, email: usuario.email, nome_completo: usuario.nome_completo, tipo_usuario: usuario.tipo_usuario }
        });
    } catch (error) {
        res.status(500).json({ message: "Erro interno no servidor durante o login." });
    }
};

// --- ESQUECI A SENHA ---
exports.esqueciSenha = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "O campo de e-mail é obrigatório." });
    }
    try {
        const usuario = await new Promise((resolve, reject) => {
            db.get("SELECT * FROM usuarios WHERE email = ?", [email], (err, row) => {
                if (err) reject(new Error("Erro ao buscar usuário."));
                resolve(row);
            });
        });
        if (!usuario) {
            return res.status(200).json({ message: "Se um usuário com este e-mail existir, um link de recuperação foi enviado." });
        }
        const resetToken = crypto.randomBytes(20).toString('hex');
        const tokenExpires = new Date(Date.now() + 3600000); // 1 hora

        const sqlUpdate = "UPDATE usuarios SET reset_token = ?, reset_token_expires = ? WHERE id_usuario = ?";
        await new Promise((resolve, reject) => {
            db.run(sqlUpdate, [resetToken, tokenExpires.toISOString(), usuario.id_usuario], function(err) {
                if (err) reject(new Error("Erro ao salvar token de reset."));
                resolve();
            });
        });

        const resetUrl = `http://localhost:5173/cliente/resetar-senha/${resetToken}`;
        const transporter = await createTestTransporter();
        const mailOptions = {
            from: '"UniFood" <no-reply@unifood.com>', to: usuario.email, subject: 'Recuperação de Senha - UniFood',
            html: `<p>Você solicitou a recuperação de senha. Clique no link a seguir para criar uma nova senha:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Este link é válido por 1 hora.</p>`
        };
        let info = await transporter.sendMail(mailOptions);
        console.log("E-mail de recuperação enviado! URL de preview (Ethereal): %s", nodemailer.getTestMessageUrl(info));
        res.status(200).json({ message: "Se um usuário com este e-mail existir, um link de recuperação foi enviado." });
    } catch (error) {
        res.status(500).json({ message: "Erro interno no servidor." });
    }
};

// --- RESETAR A SENHA ---
exports.resetarSenha = async (req, res) => {
    const { token } = req.params;
    const { senha } = req.body;
    if (!senha) {
        return res.status(400).json({ message: "A nova senha é obrigatória." });
    }
    try {
        const sqlFind = "SELECT * FROM usuarios WHERE reset_token = ? AND reset_token_expires > ?";
        const usuario = await new Promise((resolve, reject) => {
            db.get(sqlFind, [token, new Date().toISOString()], (err, row) => {
                if (err) reject(new Error("Erro ao buscar usuário pelo token."));
                resolve(row);
            });
        });
        if (!usuario) {
            return res.status(400).json({ message: "Token de recuperação inválido ou expirado." });
        }
        const novaSenhaHash = await bcrypt.hash(senha, 10);
        const sqlUpdate = "UPDATE usuarios SET senha_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id_usuario = ?";
        await new Promise((resolve, reject) => {
            db.run(sqlUpdate, [novaSenhaHash, usuario.id_usuario], function(err) {
                if (err) reject(new Error("Erro ao atualizar a senha."));
                resolve();
            });
        });
        res.status(200).json({ message: "Senha alterada com sucesso! Você já pode fazer login com sua nova senha." });
    } catch (error) {
        res.status(500).json({ message: "Erro interno no servidor." });
    }
};

// --- FUNÇÕES CRUD BÁSICAS ---
exports.listarUsuarios = (req, res) => {
    const sql = "SELECT id_usuario, nome_completo, email, telefone, cpf, tipo_usuario, ativo FROM usuarios";
    db.all(sql, [], (err, rows) => {
        if (err) { return res.status(500).json({ message: "Erro interno ao buscar usuários.", error: err.message }); }
        res.status(200).json(rows);
    });
};
exports.obterUsuarioPorId = (req, res) => {
    const sql = "SELECT id_usuario, nome_completo, email, telefone, cpf, tipo_usuario, ativo FROM usuarios WHERE id_usuario = ?";
    db.get(sql, [req.params.id], (err, row) => {
        if (err) { return res.status(500).json({ message: "Erro interno ao buscar usuário.", error: err.message }); }
        if (!row) { return res.status(404).json({ message: "Usuário não encontrado." }); }
        res.status(200).json(row);
    });
};
exports.atualizarUsuario = async (req, res) => {  };
exports.deletarUsuario = (req, res) => {  };