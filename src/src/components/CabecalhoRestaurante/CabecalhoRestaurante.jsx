import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CabecalhoRestaurante.module.css';
import { useCart } from '../../context/CartContext';




// O componente agora também recebe o nome do usuário para a saudação
function CabecalhoRestaurante({ nomeUsuario }) {
  const navigate = useNavigate();

  // Função de logout que limpa os dados e redireciona
  const handleSair = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    navigate('/restaurante/login');
  };

  return (
    <header className={styles.cabecalho}>
      <nav className={styles.nav}>
        {/* Adicionada saudação para consistência */}
        <p>Olá, {nomeUsuario || 'Restaurante'}</p>
        
        {/* Links de navegação usando botões com a função navigate */}
        <a onClick={() => navigate('/restaurante/inicio')} className={styles.navLink}>Meu Restaurante</a>
        <a onClick={() => navigate('/restaurante/meusprodutos')} className={styles.navLink}>Meus Produtos</a>
        <a onClick={() => navigate('/restaurante/criarproduto')} className={styles.navLink}>Criar Produto</a>
        
        {/* Botão "Sair" agora chama a função de logout */}
        <a onClick={handleSair} className={styles.botaoSair}>Sair</a>
      </nav>
    </header>
  );
};

export default CabecalhoRestaurante;