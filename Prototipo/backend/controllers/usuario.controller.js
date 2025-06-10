const { db } = require('../database/db.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// --- FUNÇÕES EXISTENTES (REGISTRAR E LOGIN) ---
exports.registrar = async (req, res) => {
    // Sua lógica de registro que já estava correta
};

exports.login = async (req, res) => {
    // Sua lógica de login inteligente que já estava correta
};


// --- NOVAS FUNÇÕES PARA O PERFIL ---

// BUSCAR DADOS DO PERFIL DO USUÁRIO LOGADO
exports.buscarMeuPerfil = async (req, res) => {
    try {
        const idUsuario = req.usuarioDecodificado.id_usuario;
        
        // Seleciona todos os campos EXCETO a senha por segurança
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

// ATUALIZAR DADOS DO PERFIL DO USUÁRIO LOGADO
exports.atualizarMeuPerfil = async (req, res) => {
    try {
        const idUsuario = req.usuarioDecodificado.id_usuario;
        // Pega todos os possíveis campos do corpo da requisição
        const { nome_completo, email, senha, endereco_cep, endereco_logradouro, endereco_numero, endereco_complemento, endereco_bairro, endereco_cidade, endereco_estado } = req.body;

        const queryParts = [];
        const params = [];

        // Adiciona os campos à query apenas se eles foram enviados no corpo da requisição
        if (nome_completo) { queryParts.push("nome_completo = ?"); params.push(nome_completo); }
        if (email) { queryParts.push("email = ?"); params.push(email); }
        if (endereco_cep) { queryParts.push("endereco_cep = ?"); params.push(endereco_cep); }
        if (endereco_logradouro) { queryParts.push("endereco_logradouro = ?"); params.push(endereco_logradouro); }
        if (endereco_numero) { queryParts.push("endereco_numero = ?"); params.push(endereco_numero); }
        if (endereco_complemento) { queryParts.push("endereco_complemento = ?"); params.push(endereco_complemento); }
        if (endereco_bairro) { queryParts.push("endereco_bairro = ?"); params.push(endereco_bairro); }
        if (endereco_cidade) { queryParts.push("endereco_cidade = ?"); params.push(endereco_cidade); }
        if (endereco_estado) { queryParts.push("endereco_estado = ?"); params.push(endereco_estado); }
        
        // Lógica para atualizar a senha APENAS se uma nova for fornecida
        if (senha && senha.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            const senhaHash = await bcrypt.hash(senha, salt);
            queryParts.push("senha = ?");
            params.push(senhaHash);
        }

        if (queryParts.length === 0) {
            return res.status(400).json({ message: "Nenhum dado fornecido para atualização." });
        }

        params.push(idUsuario); // Adiciona o ID do usuário para a cláusula WHERE
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


// --- Bloco de exportação final ---
module.exports = {
    registrar: exports.registrar,
    login: exports.login,
    buscarMeuPerfil: exports.buscarMeuPerfil,
    atualizarMeuPerfil: exports.atualizarMeuPerfil
};