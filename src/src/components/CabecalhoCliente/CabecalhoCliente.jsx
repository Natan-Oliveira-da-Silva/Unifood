import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Usando Link para navegação
import styles from "./CabecalhoCliente.module.css";
import { useCart } from '../../context/CartContext';
import { FaShoppingCart } from 'react-icons/fa'; 

export default function CabecalhoCliente() {
    const navigate = useNavigate();
    const { cartItems } = useCart();
    
    const [primeiroNome, setPrimeiroNome] = useState('Cliente');

    useEffect(() => {
        const userDataString = localStorage.getItem('usuario'); 
        if (userDataString) {
            try {
                const userData = JSON.parse(userDataString);
                if (userData && userData.nome_completo) {
                    const nome = userData.nome_completo.split(' ')[0];
                    setPrimeiroNome(nome);
                }
            } catch (error) {
                console.error("Erro ao ler dados do usuário do localStorage:", error);
                setPrimeiroNome('Cliente');
            }
        }
    }, []); 

    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    const handleSair = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario'); 
        navigate('/'); // Redireciona para a tela inicial geral
    };

    return (
        <header className={styles.cabecalho}>
            <nav className={styles.nav}>
                <p>Olá, {primeiroNome}</p>
                
                <div className={styles.linksNavegacao}> 
                    {/* 5. MELHORIA: Usando o componente Link para navegação correta */}
                    <Link to='/cliente/inicio' className={styles.navLink}>Home</Link>
                    <Link to='/cliente/consultarpedidos' className={styles.navLink}>Meus Pedidos</Link>
                    <Link to='/cliente/perfil' className={styles.navLink}>Perfil</Link>
                </div>
                
                <div className={styles.acoesDireita}> 
                    <Link to='/cliente/carrinho' className={styles.botaoCarrinho}>
                        <FaShoppingCart className={styles.iconeCarrinho} />
                        {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
                    </Link>
                    {/* 6. MELHORIA: Usando <button> para a ação de sair */}
                    <button type="button" onClick={handleSair} className={styles.botaoSair}>Sair</button>
                </div>
            </nav>
        </header>
    );
}
