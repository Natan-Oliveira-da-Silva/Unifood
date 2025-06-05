
const db = require('../database/db');


exports.getMeuRestaurante = async (req, res) => {
    
    const idUsuarioResponsavel = req.usuarioDecodificado.id_usuario;

    if (!idUsuarioResponsavel) {
        
        return res.status(400).json({ message: "ID do usuário não encontrado no token." });
    }

    const sql = `
        SELECT 
            r.*, 
            c.nome AS nome_cozinha 
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
    const id_usuario_responsavel = req.usuarioDecodificado.id_usuario;
    const {
        nome, id_cozinha, taxa_frete = 0.0, url_imagem_logo,
        endereco_cep, endereco_logradouro, endereco_numero, endereco_complemento,
        endereco_bairro, endereco_cidade, endereco_estado
    } = req.body;

    if (!nome) {
        return res.status(400).json({ message: "O nome do restaurante é obrigatório." });
    }
    if (!id_cozinha) {
        return res.status(400).json({ message: "O tipo de cozinha (id_cozinha) é obrigatório." });
    }
  

    try {
        const existingRestaurant = await new Promise((resolve, reject) => {
            db.get("SELECT id_restaurante FROM restaurantes WHERE id_usuario_responsavel = ?",
                [id_usuario_responsavel],
                (err, row) => {
                    if (err) {
                        console.error("Erro ao verificar restaurante existente:", err.message);
                        reject(new Error("Erro interno ao verificar dados do restaurante."));
                    }
                    resolve(row);
                }
            );
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
                if (err.message.includes("FOREIGN KEY constraint failed")) {

                    // Verifica se o erro é especificamente da FK de id_cozinha
                    if (err.message.toLowerCase().includes("cozinhas")) {
                         return res.status(400).json({ message: "ID da cozinha inválido ou não encontrado." });
                    }
                    return res.status(400).json({ message: "Restrição de chave estrangeira falhou. Verifique os IDs fornecidos." });
                }
                return res.status(500).json({ message: "Erro interno ao cadastrar o restaurante.", error: err.message });
            }
            res.status(201).json({
                message: "Restaurante cadastrado com sucesso!",
                id_restaurante: this.lastID,
                nome,
                id_cozinha,
                id_usuario_responsavel
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
