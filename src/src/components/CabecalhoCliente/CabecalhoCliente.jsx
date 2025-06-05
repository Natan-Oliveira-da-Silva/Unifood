// src/components/CabecalhoCliente/CabecalhoCliente.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "./CabecalhoCliente.module.css";

// O componente recebe 'nomeUsuario' para exibir a saudação personalizada
function CabecalhoCliente({ nomeUsuario }) {
  // O hook useNavigate é a forma correta de navegar em uma aplicação React SPA
  const navigate = useNavigate();

  // Esta função agora limpa os dados de login e redireciona para a página de login
  const handleSair = () => {
    // 1. Limpa os dados de autenticação salvos no navegador
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // 2. Redireciona o usuário para a tela de login correta
    navigate('/cliente/login');
  };

  return (
    <header className={styles.cabecalho}>
      <nav className={styles.nav}>
        {/* Saudação dinâmica */}
        <p>Olá, {nomeUsuario || 'Cliente'}</p>

        {/* Links de navegação usando botões com navigate */}
        <a onClick={() => navigate('/cliente/inicio')} className={styles.navLink}>Home</a>
        <a onClick={() => navigate('/cliente/consultarpedidos')} className={styles.navLink}>Consultar Pedidos</a>
        <a onClick={() => navigate('/cliente/perfil')} className={styles.navLink}>Perfil</a>
        <a onClick={() => navigate('/cliente/carrinho')} className={styles.navLink}>Carrinho</a>
        
        {/* Botão "Sair" agora chama a função handleSair */}
        <a onClick={handleSair} className={styles.botaoSair}>Sair</a>
      </nav>
    </header>
  );
}

export default CabecalhoCliente;