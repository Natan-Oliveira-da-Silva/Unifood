import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "./CabecalhoCliente.module.css";
import { useCart } from '../../context/CartContext';
import { FaShoppingCart } from 'react-icons/fa'; 

export default function CabecalhoCliente({ nomeUsuario }) {
    const navigate = useNavigate();
    const { cartItems } = useCart();

    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    const handleSair = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        navigate('/');
    };

    return (
        <header className={styles.cabecalho}>
            <nav className={styles.nav}>
                <p>Olá, {nomeUsuario || 'Cliente'}</p>
                <div className={styles.linksNavegacao}> 
                    <a onClick={() => navigate('/cliente/inicio')} className={styles.navLink}>Home</a>
                    <a onClick={() => navigate('/cliente/consultarpedidos')} className={styles.navLink}>Consultar Pedidos</a>
                    <a onClick={() => navigate('/cliente/perfil')} className={styles.navLink}>Perfil</a>
                </div>
                
                <div className={styles.acoesDireita}> 

                    <a onClick={() => navigate('/cliente/carrinho')} className={styles.botaoCarrinho}>
                        <FaShoppingCart className={styles.iconeCarrinho} />
                        {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
                    </a>
                    <a onClick={handleSair} className={styles.botaoSair}>Sair</a>
                </div>
            </nav>
        </header>
    );
}