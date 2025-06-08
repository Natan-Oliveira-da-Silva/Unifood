const jwt = require('jsonwebtoken');

// A constante JWT_SECRET foi REMOVIDA daqui

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        // ✅ ALTERAÇÃO AQUI: Usando o segredo do arquivo .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.usuarioDecodificado = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
};

module.exports = authMiddleware;