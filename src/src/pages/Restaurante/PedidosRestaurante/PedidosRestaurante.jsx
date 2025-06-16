import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CabecalhoRestaurante from '../../../components/CabecalhoRestaurante/CabecalhoRestaurante.jsx';
import styles from './PedidosRestaurante.module.css';
import imagemProdutoPadrao from '../../../assets/restaure.png';

const API_URL = 'http://localhost:3001';

export default function PedidosRestaurante() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // estado para a mensagem de sucesso
    const [successMessage, setSuccessMessage] = useState('');

    const navigate = useNavigate();

    const fetchPedidos = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Sessão inválida.");
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`${API_URL}/api/pedidos/restaurante`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Falha ao buscar pedidos.');
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

    const handleStatusChange = async (idPedido, novoStatus) => {
        let motivo = '';
        if (novoStatus === 'Cancelado') {
            motivo = prompt("Por favor, informe o motivo do cancelamento (será visível ao cliente):");
            if (motivo === null || motivo.trim() === '') {
                return;
            }
        }
        
        setError('');
        setSuccessMessage('');

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/pedidos/${idPedido}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: novoStatus, motivo_cancelamento: motivo })
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Não foi possível atualizar o status.');
            }
            
            setSuccessMessage(`Status do Pedido #${idPedido} atualizado para "${novoStatus}".`);
            fetchPedidos();

            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);

        } catch (err) {
            setError(err.message);
        }
    };

    const getStatusClass = (status) => {
        const statusClass = status?.toLowerCase().replace(/ /g, '') || 'recebido';
        return styles[statusClass] || styles.recebido;
    };
    
    if (loading) return <div><CabecalhoRestaurante /><p className={styles.mensagem}>Carregando pedidos...</p></div>;
    
    return (
        <>
            <CabecalhoRestaurante />
            <main className={styles.container}>
                <h1>Pedidos Recebidos</h1>
                
                {error && <p className={styles.mensagemErro}>{error}</p>}
                {successMessage && <p className={styles.mensagemSucesso}>{successMessage}</p>}

                {pedidos.length === 0 ? (
                    <p className={styles.mensagem}>Nenhum pedido recebido até o momento.</p>
                ) : (
                    <div className={styles.listaPedidos}>
                        {pedidos.map(pedido => (
                            <div key={pedido.id_pedido} className={styles.pedidoCard}>
                                <div className={styles.pedidoHeader}>
                                    <h3>Pedido #{pedido.id_pedido}</h3>
                                    <span className={`${styles.status} ${getStatusClass(pedido.status)}`}>{pedido.status}</span>
                                </div>
                                <div className={styles.detalhesGrid}>
                                    <div><strong>Cliente:</strong> {pedido.nome_cliente}</div>
                                    <div><strong>Data:</strong> {new Date(pedido.data_pedido).toLocaleString('pt-BR')}</div>
                                    <div><strong>Total:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.valor_total)}</div>
                                    <div><strong>Pagamento:</strong> {pedido.forma_pagamento_nome}</div>
                                    <div className={styles.endereco}><strong>Endereço:</strong> {`${pedido.endereco_logradouro || ''}, ${pedido.endereco_numero || ''} - ${pedido.endereco_bairro || ''}`}</div>
                                </div>
                                <div className={styles.itensPedido}>
                                    <strong>Itens:</strong>
                                    <ul>
                                        {pedido.itens?.map(item => (
                                            <li key={item.id_item_pedido} className={styles.item}>
                                                <img 
                                                    src={item.url_imagem ? `${API_URL}${item.url_imagem}` : imagemProdutoPadrao} 
                                                    alt={item.nome_produto} 
                                                    className={styles.imagemItem}
                                                />
                                                <span className={styles.itemInfo}>
                                                    {item.quantidade}x {item.nome_produto}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {pedido.observacao && <p className={styles.observacao}><strong>Observação do Cliente:</strong> {pedido.observacao}</p>}
                                {pedido.motivo_cancelamento && <p className={styles.cancelamento}><strong>Motivo do Cancelamento:</strong> {pedido.motivo_cancelamento}</p>}
                                <div className={styles.acoes}>
                                    <label htmlFor={`status-${pedido.id_pedido}`}>Alterar Status:</label>
                                    <select 
                                        id={`status-${pedido.id_pedido}`}
                                        value={pedido.status} 
                                        onChange={(e) => handleStatusChange(pedido.id_pedido, e.target.value)}
                                    >
                                        <option value="Recebido">Recebido</option>
                                        <option value="Em preparo">Em preparo</option>
                                        <option value="Saiu para entrega">Saiu para entrega</option>
                                        <option value="Finalizado">Finalizado</option>
                                        <option value="Cancelado">Cancelar Pedido</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}