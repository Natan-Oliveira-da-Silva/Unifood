import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CabecalhoCliente from '../../../components/CabecalhoCliente/CabecalhoCliente';
import styles from './ConsultarPedidos.module.css';

const API_URL = 'http://localhost:3001';

export default function ConsultarPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPedidos = useCallback(async () => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Sessão inválida. Por favor, faça o login.');
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`${API_URL}/api/pedidos`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Falha ao buscar histórico de pedidos.');
            }
            const data = await response.json();
            setPedidos(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPedidos();
    }, [fetchPedidos]);

    const handleCancelarPedido = async (idPedido) => {
        if (!window.confirm(`Tem certeza que deseja cancelar o Pedido #${idPedido}?`)) return;

        const motivo = prompt("Por favor, informe o motivo do cancelamento:");
        if (motivo === null || motivo.trim() === '') {
            alert("O motivo do cancelamento é obrigatório.");
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/pedidos/${idPedido}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: 'Cancelado', motivo_cancelamento: motivo }),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Falha ao cancelar o pedido.');
            }
            alert(`Pedido #${idPedido} cancelado com sucesso.`);
            fetchPedidos(); // Atualiza a lista
        } catch (err) {
            alert(err.message);
        }
    };
    
    const getStatusClass = (status) => {
        const statusClass = status?.toLowerCase().replace(/ /g, '') || 'recebido';
        return styles[statusClass] || styles.recebido;
    };

    if (loading) return <div><CabecalhoCliente /><p className={styles.mensagem}>Carregando seus pedidos...</p></div>;
    if (error) return <div><CabecalhoCliente /><p className={styles.mensagemErro}>{error}</p></div>;

    return (
        <>
            <CabecalhoCliente />
            <main className={styles.container}>
                <h1>Meus Pedidos</h1>
                <div className={styles.listaPedidos}>
                    {pedidos.length > 0 ? (
                        pedidos.map(pedido => (
                            <div key={pedido.id_pedido} className={styles.pedidoCard}>
                                <div className={styles.pedidoHeader}>
                                    <h3>{pedido.nome_restaurante}</h3>
                                    <span className={`${styles.status} ${getStatusClass(pedido.status)}`}>{pedido.status}</span>
                                </div>
                                <div className={styles.pedidoInfo}>
                                    <p><strong>Pedido:</strong> #{pedido.id_pedido}</p>
                                    <p><strong>Data:</strong> {new Date(pedido.data_pedido).toLocaleString('pt-BR')}</p>
                                    <p><strong>Total:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.valor_total)}</p>
                                </div>
                                
                                <div className={styles.itensPedido}>
                                    <strong>Itens:</strong>
                                    <ul>
                                        {pedido.itens?.map(item => (
                                            <li key={item.id_item_pedido}>{item.quantidade}x {item.nome_produto}</li>
                                        ))}
                                    </ul>
                                </div>

                                {pedido.motivo_cancelamento && <p className={styles.cancelamento}><strong>Motivo do Cancelamento:</strong> {pedido.motivo_cancelamento}</p>}

                                <div className={styles.acoes}>
                                    {pedido.status === 'Recebido' && (
                                        <button onClick={() => handleCancelarPedido(pedido.id_pedido)} className={styles.botaoCancelar}>Cancelar Pedido</button>
                                    )}
                                    {pedido.status === 'Finalizado' && !pedido.nota_avaliacao && (
                                        <button className={styles.botaoAvaliar}>Avaliar</button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.semPedidos}>
                            <p>Você ainda não fez nenhum pedido.</p>
                            <Link to="/cliente/inicio" className={styles.botaoPrimario}>Ver Restaurantes</Link>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
