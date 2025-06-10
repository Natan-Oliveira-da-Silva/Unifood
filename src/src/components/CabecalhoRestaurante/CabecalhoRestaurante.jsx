import React, { useState, useEffect } from 'react'; // ✅ Importa useState e useEffect
import { Link, useNavigate } from 'react-router-dom'; 
import styles from './CabecalhoRestaurante.module.css';

function CabecalhoRestaurante({ nomeUsuario }) {
    const navigate = useNavigate();
    
    // ✅ Estado para armazenar a contagem de pedidos
    const [contagemPedidos, setContagemPedidos] = useState(0);

    // ✅ useEffect para buscar a contagem de pedidos periodicamente
    useEffect(() => {
        const fetchContagem = async () => {
            const token = localStorage.getItem('token');
            if (!token) return; // Não faz nada se não estiver logado

            try {
                const response = await fetch('http://localhost:3001/api/pedidos/restaurante/contagem-novos', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setContagemPedidos(data.contagem);
                }
            } catch (error) {
                console.error("Erro ao buscar contagem de pedidos:", error);
            }
        };

        fetchContagem(); // Busca a contagem quando o componente carrega

        // Configura um intervalo para verificar novos pedidos a cada 30 segundos
        const intervalId = setInterval(fetchContagem, 30000);

        // Limpa o intervalo quando o componente é desmontado para evitar vazamentos de memória
        return () => clearInterval(intervalId);
    }, []); // O array vazio [] faz com que este efeito rode apenas uma vez (na montagem)

    const handleSair = () => {
        console.log("Executando logout...");
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        navigate('/'); // Redirecionado para a página inicial geral
    };

    return (
        <header className={styles.cabecalho}>
            <nav className={styles.nav}>
                <p className={styles.saudacao}>Olá, {nomeUsuario || 'Restaurante'}</p>
                
                <Link to='/restaurante/inicio' className={styles.navLink}>Meu Restaurante</Link>
                <Link to="/restaurante/meusprodutos" className={styles.navLink}>Meus Produtos</Link>
                
                <Link to="/restaurante/pedidos" className={styles.navLink}>
                    Pedidos
                    {contagemPedidos > 0 && (
                        <span className={styles.badge}>{contagemPedidos}</span>
                    )}
                </Link>

                <Link to="/restaurante/criarproduto" className={styles.navLink}>Criar Produto</Link>
                
                <a type="button" onClick={handleSair} className={styles.botaoSair}>
                    Sair
                </a>
            </nav>
        </header>
    );
};

export default CabecalhoRestaurante;