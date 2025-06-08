import React from 'react';
// ✅ Importando o 'Link' para uma navegação mais correta
import { Link, useNavigate } from 'react-router-dom'; 
import styles from './CabecalhoRestaurante.module.css';
// import { useCart } from '../../context/CartContext'; // Removido pois não estava sendo usado

// O componente agora também recebe o nome do usuário para a saudação
function CabecalhoRestaurante({ nomeUsuario }) {
  const navigate = useNavigate();

  // Função de logout que limpa os dados e redireciona
  const handleSair = () => {
    // Adicionando um log para depuração no console (F12)
    console.log("Executando logout...");

    // ✅ CORREÇÃO PRINCIPAL: Usando a chave correta 'token'
    localStorage.removeItem('token');
    localStorage.removeItem('userData'); // Mantido para limpar dados extras do usuário
    
    navigate('/'); // Redirecionado para a página de login principal
  };

  return (
    <header className={styles.cabecalho}>
      <nav className={styles.nav}>
        <p className={styles.saudacao}>Olá, {nomeUsuario || 'Restaurante'}</p>
        
        {/* ✅ MELHORIA: Usando o componente <Link> para navegação */}
        <Link to='/restaurante/inicio' className={styles.navLink}>Meu Restaurante</Link>
        <Link to="/restaurante/meusprodutos" className={styles.navLink}>Meus Produtos</Link>
        <Link to="/restaurante/criarproduto" className={styles.navLink}>Criar Produto</Link>
        
        {/* ✅ MELHORIA: Usando <button> para a ação de sair */}
        <a type="button" onClick={handleSair} className={styles.botaoSair}>
            Sair
        </a>
      </nav>
    </header>
  );
};

export default CabecalhoRestaurante;