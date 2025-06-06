// src/pages/Cliente/ConsultarPedidos/ConsultarPedidos.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ConsultarPedidos.module.css';
import CabecalhoCliente from '../../../components/CabecalhoCliente/CabecalhoCliente.jsx';

export default function ConsultarPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPedidos = async () => {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                // Redireciona para o login se não houver token
                navigate('/cliente/login');
                return;
            }

            try {
                const response = await fetch('http://localhost:3001/api/pedidos', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Erro ao buscar o histórico de pedidos.');
                }
                setPedidos(data);
            } catch (error) {
                console.error("Erro ao buscar pedidos:", error);
                setErro(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPedidos();
    }, [navigate]);

    const handlePedirNovamente = (pedido) => {
        // Lógica futura: buscar os itens deste pedido e adicioná-los ao carrinho.
        alert(`Funcionalidade "Pedir Novamente" para o pedido #${pedido.codigo_pedido} a ser implementada!`);
    };
    
    // Como não temos um "título" do pedido, usaremos o nome do restaurante
    const gerarTituloPedido = (pedido) => {
        return `Pedido em ${pedido.nome_restaurante}`;
    };

    return (
        <>
            <CabecalhoCliente />
            <div className={styles.container}>
                <h1 className={styles.titulo}>Histórico de pedidos</h1>

                {loading && <p className={styles.aviso}>Carregando seu histórico...</p>}
                {erro && <p className={`${styles.aviso} ${styles.erro}`}>{erro}</p>}

                {!loading && !erro && (
                    <div className={styles.listaPedidos}>
                        {pedidos.length === 0 ? (
                            <div className={styles.semPedidos}>
                                <p className={styles.aviso}>Você ainda não fez nenhum pedido.</p>
                                <button onClick={() => navigate('/cliente/inicio')} className={styles.botaoAcaoPrincipal}>
                                    Fazer meu primeiro pedido
                                </button>
                            </div>
                        ) : (
                            pedidos.map(pedido => (
                                <div key={pedido.id_pedido} className={styles.cardPedido}>
                                    {/* Usando o nome do restaurante como título principal do card */}
                                    <h2 className={styles.pedidoTitulo}>{gerarTituloPedido(pedido)}</h2>
                                    
                                    <div className={styles.pedidoInfo}>
                                        <p>ID do pedido: {pedido.codigo_pedido.toUpperCase()}</p>
                                        <p>Status: 
                                            {/* A classe do status muda de acordo com o valor para aplicarmos cores diferentes */}
                                            <span className={`${styles.status} ${styles[pedido.status_pedido.toLowerCase()]}`}>
                                                {pedido.status_pedido.replace('_', ' ')}
                                            </span>
                                        </p>
                                        <p>Restaurante: {pedido.nome_restaurante}</p>
                                    </div>

                                    <div className={styles.pedidoAcoes}>
                                        <button className={styles.botaoAcao}>Avaliar</button>
                                        <button onClick={() => handlePedirNovamente(pedido)} className={styles.botaoAcao}>Pedir novamente</button>
                                        <button className={styles.botaoAcao}>Ajuda</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </>
    );
}