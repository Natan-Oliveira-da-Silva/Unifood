const { db } = require('../database/db.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// --- REGISTRAR NOVO USUÁRIO ---
exports.registrar = async (req, res) => {
    try {
        const { nome_completo, email, senha, tipo_usuario } = req.body;
        if (!nome_completo || !email || !senha || !tipo_usuario) {
            return res.status(400).json({ message: "Nome, e-mail, senha e tipo de usuário são obrigatórios." });
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
        
        const sql = `INSERT INTO usuarios (nome_completo, email, senha, tipo_usuario) VALUES (?, ?, ?, ?)`;
        db.run(sql, [nome_completo, email, senhaHash, tipo_usuario], function (err) {
            if (err) {
                console.error("Erro ao registrar usuário:", err);
                return res.status(500).json({ message: `Erro ao registrar usuário.` });
            }
            res.status(201).json({ message: "Usuário registrado com sucesso!", id_usuario: this.lastID });
        });
    } catch (error) {
        res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
    }
};

// --- LOGIN DE USUÁRIO ---
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

        if (!usuario) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        if (tipo_usuario && usuario.tipo_usuario !== tipo_usuario) {
            return res.status(403).json({ message: `Acesso negado para este tipo de usuário.` });
        }

        let possuiRestaurante = false;
        if (usuario.tipo_usuario === 'R') {
            const restaurante = await new Promise((resolve, reject) => {
                db.get("SELECT id_restaurante FROM restaurantes WHERE id_usuario_responsavel = ?", [usuario.id_usuario], (err, row) => {
                    if (err) return reject(new Error("Erro ao verificar restaurante do usuário."));
                    resolve(row);
                });
            });
            possuiRestaurante = !!restaurante;
        }

        const payload = { 
            id_usuario: usuario.id_usuario, 
            email: usuario.email, 
            tipo_usuario: usuario.tipo_usuario 
        };
        
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

        const dadosUsuarioParaFrontend = { ...payload, possuiRestaurante };

        res.status(200).json({ 
            message: "Login bem-sucedido!", 
            token: token, 
            usuario: dadosUsuarioParaFrontend
        });

    } catch (error) {
        console.error("Erro fatal no processo de login:", error);
        res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
    }
};

// --- FUNÇÕES DE PERFIL ---
exports.buscarMeuPerfil = async (req, res) => {
    try {
        const idUsuario = req.usuarioDecodificado.id_usuario;
        const sql = `SELECT id_usuario, nome_completo, email, endereco_cep, endereco_logradouro, endereco_numero, endereco_complemento, endereco_bairro, endereco_cidade, endereco_estado FROM usuarios WHERE id_usuario = ?`;
        const usuario = await new Promise((resolve, reject) => {
            db.get(sql, [idUsuario], (err, row) => {
                if (err) return reject(new Error("Erro ao buscar perfil no banco de dados."));
                if (!row) return reject(new Error("Usuário não encontrado."));
                resolve(row);
            });
        });
        res.status(200).json(usuario);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

exports.atualizarMeuPerfil = async (req, res) => {
    try {
        const idUsuario = req.usuarioDecodificado.id_usuario;
        const { nome_completo, email, senha, endereco_cep, endereco_logradouro, endereco_numero, endereco_complemento, endereco_bairro, endereco_cidade, endereco_estado } = req.body;
        const queryParts = [];
        const params = [];

        if (nome_completo) { queryParts.push("nome_completo = ?"); params.push(nome_completo); }
        if (email) { queryParts.push("email = ?"); params.push(email); }
        if (endereco_cep) { queryParts.push("endereco_cep = ?"); params.push(endereco_cep); }
        if (endereco_logradouro) { queryParts.push("endereco_logradouro = ?"); params.push(endereco_logradouro); }
        if (endereco_numero) { queryParts.push("endereco_numero = ?"); params.push(endereco_numero); }
        if (endereco_complemento) { queryParts.push("endereco_complemento = ?"); params.push(endereco_complemento); }
        if (endereco_bairro) { queryParts.push("endereco_bairro = ?"); params.push(endereco_bairro); }
        if (endereco_cidade) { queryParts.push("endereco_cidade = ?"); params.push(endereco_cidade); }
        if (endereco_estado) { queryParts.push("endereco_estado = ?"); params.push(endereco_estado); }
        
        if (senha && senha.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            const senhaHash = await bcrypt.hash(senha, salt);
            queryParts.push("senha = ?");
            params.push(senhaHash);
        }

        if (queryParts.length === 0) {
            return res.status(400).json({ message: "Nenhum dado fornecido para atualização." });
        }

        params.push(idUsuario);
        const sql = `UPDATE usuarios SET ${queryParts.join(', ')} WHERE id_usuario = ?`;
        
        db.run(sql, params, function (err) {
            if (err) {
                if (err.message.includes("UNIQUE constraint failed: usuarios.email")) {
                    return res.status(409).json({ message: "O e-mail informado já está em uso por outra conta." });
                }
                return res.status(500).json({ message: "Erro de banco de dados ao atualizar o perfil." });
            }
            res.status(200).json({ message: "Perfil atualizado com sucesso!" });
        });
    } catch (error) {
        res.status(500).json({ message: "Ocorreu um erro inesperado no servidor." });
    }
};

// --- EXPORTAÇÕES ---
module.exports = {
    registrar: exports.registrar,
    login: exports.login,
    buscarMeuPerfil: exports.buscarMeuPerfil,
    atualizarMeuPerfil: exports.atualizarMeuPerfil
};
