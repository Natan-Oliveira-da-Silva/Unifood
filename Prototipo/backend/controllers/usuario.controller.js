const { db } = require('../database/db.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// REGISTRAR NOVO USUÁRIO
exports.registrar = async (req, res) => {
    try {
        const { email, senha, tipo_usuario } = req.body;
        if (!email || !senha || !tipo_usuario) {
            return res.status(400).json({ message: "Todos os campos são obrigatórios." });
        }
        const userExists = await new Promise((resolve, reject) => {
            db.get("SELECT email FROM usuarios WHERE email = ?", [email], (err, row) => {
                if (err) return reject(new Error("Erro ao verificar o banco de dados."));
                resolve(row);
            });
        });
        if (userExists) {
            return res.status(409).json({ message: "Este e-mail já está em uso." });
        }
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);
        const sql = "INSERT INTO usuarios (email, senha, tipo_usuario) VALUES (?, ?, ?)";
        db.run(sql, [email, senhaHash, tipo_usuario], function (err) {
            if (err) return res.status(500).json({ message: `Erro ao registrar usuário.` });
            res.status(201).json({ message: "Usuário registrado com sucesso!", id_usuario: this.lastID });
        });
    } catch (error) {
        res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
    }
};

// LOGIN DE USUÁRIO (LÓGICA ATUALIZADA)
exports.login = async (req, res) => {
    try {
        const { email, senha, tipo_usuario } = req.body;
        if (!email || !senha) {
            return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
        }

        const usuario = await new Promise((resolve, reject) => {
            db.get("SELECT * FROM usuarios WHERE email = ?", [email], (err, row) => {
                if (err) return reject(new Error("Erro no servidor ao buscar usuário."));
                resolve(row);
            });
        });

        if (!usuario || !usuario.senha) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        if (tipo_usuario && usuario.tipo_usuario !== tipo_usuario) {
            return res.status(403).json({ message: `Acesso negado para este tipo de usuário.` });
        }

        // --- LÓGICA NOVA ADICIONADA ---
        // Verifica se o usuário já possui um restaurante associado
        const restaurante = await new Promise((resolve, reject) => {
            db.get("SELECT id_restaurante FROM restaurantes WHERE id_usuario_responsavel = ?", [usuario.id_usuario], (err, row) => {
                if (err) return reject(new Error("Erro ao verificar o restaurante do usuário."));
                resolve(row);
            });
        });
        const possuiRestaurante = !!restaurante; // Converte o resultado para true ou false

        const payload = { 
            id_usuario: usuario.id_usuario, 
            email: usuario.email, 
            tipo_usuario: usuario.tipo_usuario 
        };
        
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

        // Envia a resposta completa, incluindo a informação se possui restaurante
        res.status(200).json({ 
            message: "Login bem-sucedido!", 
            token: token, 
            usuario: { ...payload, possuiRestaurante } 
        });

    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
    }
};