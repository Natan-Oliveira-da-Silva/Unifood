import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from "./CabecalhoRestaurante.module.css";
import { FaBars, FaTimes } from 'react-icons/fa';

export default function CabecalhoRestaurante() {
    const navigate = useNavigate();
    const [nome, setNome] = useState("Restaurante");
    const [menuAberto, setMenuAberto] = useState(false);

 useEffect(() => {
    const userDataString = localStorage.getItem('usuario');
    if (userDataString) {
        try {
            const userData = JSON.parse(userDataString);

            const nome =
                userData?.nome_restaurante ||
                userData?.restaurante?.nome ||
                userData?.nome_completo?.split(" ")[0] ||
                "Restaurante";

            setNome(nome);
        } catch (e) {
            console.error("Erro ao carregar nome:", e);
        }
    }
}, []);

    const handleSair = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/');
    };

    return (
        <header className={styles.cabecalho}>
            <nav className={styles.nav}>
                <button className={styles.menuButton} onClick={() => setMenuAberto(true)}>
                    <FaBars />
                </button>

                <Link to="/restaurante/inicio" className={styles.navLink}>
                    <p>Olá, {nome}</p>
                </Link>

                <div className={styles.linksNavegacao}>
                    <Link to='/restaurante/pedidos' className={styles.navLink}>Pedidos</Link>
                    <Link to='/restaurante/criarproduto' className={styles.navLink}>Cadastrar Produto</Link>
                    <Link to='/restaurante/meusprodutos' className={styles.navLink}>Meus Produtos</Link>
                </div>

                <div className={styles.acoesDireita}>
                    <button type="button" onClick={handleSair} className={styles.botaoSair}>Sair</button>
                </div>
            </nav>

            <div className={`${styles.sidebar} ${menuAberto ? styles.aberto : ''}`}>
                <button className={styles.fecharMenu} onClick={() => setMenuAberto(false)}>
                    <FaTimes />
                </button>
                <Link to='/restaurante/pedidos' className={styles.sidebarLink} onClick={() => setMenuAberto(false)}>Pedidos</Link>
                <Link to='/restaurante/criarproduto' className={styles.sidebarLink} onClick={() => setMenuAberto(false)}>Cadastrar Produto</Link>
                <Link to='/restaurante/meusprodutos' className={styles.sidebarLink} onClick={() => setMenuAberto(false)}>Meus Produtos</Link>
                <button onClick={handleSair} className={styles.sidebarLink}>Sair</button>
            </div>
        </header>
    );
}
