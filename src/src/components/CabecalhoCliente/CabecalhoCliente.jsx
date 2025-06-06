// src/components/CabecalhoCliente/CabecalhoCliente.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "./CabecalhoCliente.module.css";
import { useCart } from '../../context/CartContext'; // Importa nosso hook

export default function CabecalhoCliente({ nomeUsuario }) {
    const navigate = useNavigate();
    const { cartItems } = useCart(); // Pega os itens do carrinho do contexto

    // Calcula a quantidade total de itens
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    const handleSair = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        navigate('/cliente/login');
    };

    return (
        <header className={styles.cabecalho}>
            <nav className={styles.nav}>
                <p>Olá, {nomeUsuario || 'Cliente'}</p>
                <a onClick={() => navigate('/cliente/inicio')} className={styles.navLink}>Home</a>
                <a onClick={() => navigate('/cliente/consultarpedidos')} className={styles.navLink}>Consultar Pedidos</a>
                <a onClick={() => navigate('/cliente/perfil')} className={styles.navLink}>Perfil</a>
                <a onClick={() => navigate('/cliente/carrinho')} className={styles.navLink}>
                    Carrinho {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
                </a>
                <a onClick={handleSair} className={styles.botaoSair}>Sair</a>
            </nav>
        </header>
    );
}