// src/pages/cliente/ConsultarPedidos/ConsultarPedidos.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CabecalhoCliente from '../../../components/CabecalhoCliente/CabecalhoCliente.jsx';
import styles from './ConsultarPedidos.module.css';

export default function ConsultarPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchMeusPedidos = useCallback(async () => {
        // ... (lógica de busca que já implementamos) ...
    }, []);

    useEffect(() => {
        // ...
    }, [fetchMeusPedidos]);

    // Função para pegar a classe CSS baseada no status
    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'finalizado': return styles.finalizado;
            case 'cancelado': return styles.cancelado;
            case 'em preparo': return styles.emPreparo;
            default: return styles.recebido;
        }
    };
    
    // JSX para renderizar um único pedido
    const PedidoCard = ({ pedido }) => {
        const [nota, setNota] = useState(pedido.nota_avaliacao || '');
        const [comentario, setComentario] = useState(pedido.comentario_avaliacao || '');

        const handleAvaliar = async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`http://localhost:3001/api/pedidos/${pedido.id_pedido}/avaliar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ nota, comentario })
                });
                if(!res.ok) throw new Error("Não foi possível salvar a avaliação.");
                alert("Avaliação salva com sucesso!");
                // O ideal seria atualizar o estado do pedido aqui para refletir a avaliação
            } catch (err) {
                alert(err.message);
            }
        };

        return (
            <div className={styles.pedidoCard}>
                <div className={styles.pedidoHeader}>
                    <h3>Pedido em {pedido.nome_restaurante}</h3>
                    <span className={`${styles.status} ${getStatusClass(pedido.status)}`}>{pedido.status}</span>
                </div>
                <div className={styles.pedidoBody}>
                    <p><strong>Data:</strong> {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Valor Total:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.valor_total)}</p>
                </div>
                <div className={styles.pedidoAvaliacao}>
                    <h4>Sua Avaliação</h4>
                    <form onSubmit={handleAvaliar}>
                        <label>Nota (0 a 10):</label>
                        <input type="number" min="0" max="10" value={nota} onChange={(e) => setNota(e.target.value)} required />
                        <label>Comentário:</label>
                        <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Deixe seu feedback..."/>
                        <button type="submit">Enviar Avaliação</button>
                    </form>
                </div>
            </div>
        );
    };


    if (loading) return <p>Carregando seus pedidos...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
            <CabecalhoCliente />
            <main className={styles.container}>
                <h1>Meus Pedidos</h1>
                <div className={styles.listaPedidos}>
                    {pedidos.length > 0 ? (
                        pedidos.map(pedido => <PedidoCard key={pedido.id_pedido} pedido={pedido} />)
                    ) : (
                        <p>Você ainda não fez nenhum pedido.</p>
                    )}
                </div>
            </main>
        </>
    );
}