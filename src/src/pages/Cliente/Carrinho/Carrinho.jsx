// src/pages/Cliente/Carrinho/Carrinho.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import styles from './Carrinho.module.css';
import CabecalhoCliente from '../../../components/CabecalhoCliente/CabecalhoCliente.jsx';
import imagemProdutoPadrao from '../../../assets/restaure.png';

export default function Carrinho() {
    const { cartItems, removeFromCart, updateItemQuantity, clearCart } = useCart();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    
    // ✅ Estados para os novos campos do pedido
    const [observacao, setObservacao] = useState('');
    const [idFormaPagamento, setIdFormaPagamento] = useState('1'); // Ex: '1' para Dinheiro como padrão

    const calcularSubtotalItem = (item) => {
        return item.preco * item.quantity;
    };

    const calcularTotalCarrinho = () => {
        return cartItems.reduce((total, item) => total + calcularSubtotalItem(item), 0);
    };

    const formatarPreco = (preco) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco);
    };

    const handleFinalizarCompra = async () => {
        setLoading(true);
        setErro('');

        if (cartItems.length === 0) {
            setErro("Seu carrinho está vazio.");
            setLoading(false);
            return;
        }

        // ✅ CORREÇÃO 1: Usando a chave correta 'token'
        const token = localStorage.getItem('token');
        if (!token) {
            setErro("Autenticação necessária. Faça o login para continuar.");
            setLoading(false);
            return;
        }

        // ✅ CORREÇÃO 2: Montando o corpo da requisição no formato esperado pelo backend
        const pedidoParaEnviar = {
            id_restaurante: cartItems[0]?.id_restaurante,
            id_forma_pagamento: parseInt(idFormaPagamento),
            observacao: observacao,
            itens: cartItems.map(item => ({
                id_produto: item.id_produto,
                // O nome da propriedade no seu context é 'quantity', mas o backend pode esperar 'quantidade'
                // Ajuste aqui se necessário, vamos assumir que o backend espera 'quantidade'.
                quantidade: item.quantity 
            }))
        };
        
        try {
            const response = await fetch('http://localhost:3001/api/pedidos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(pedidoParaEnviar)
            });

            const data = await response.json();
            if (!response.ok) {
                // Trata o caso de sessão expirada de forma amigável
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    setErro("Sua sessão expirou. Por favor, faça login novamente.");
                    setTimeout(() => navigate('/cliente/login'), 3000);
                } else {
                    throw new Error(data.message || "Não foi possível finalizar o pedido.");
                }
            } else {
                alert("Pedido realizado com sucesso!");
                clearCart();
                navigate('/cliente/consultarpedidos');
            }

        } catch (error) {
            setErro(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <CabecalhoCliente />
            <div className={styles.container}>
                <h1 className={styles.titulo}>Meu Carrinho</h1>

                {erro && <p className={styles.erroGeral}>{erro}</p>}

                {cartItems.length === 0 ? (
                    <div className={styles.carrinhoVazio}>
                        <p>Seu carrinho está vazio.</p>
                        <button onClick={() => navigate('/cliente/inicio')}>
                            Ver Restaurantes
                        </button>
                    </div>
                ) : (
                    <div className={styles.carrinhoContainer}>
                        <div className={styles.listaItens}>
                            {cartItems.map(item => (
                                <div key={item.id_produto} className={styles.itemCarrinho}>
                                    <img src={item.url_imagem_principal || imagemProdutoPadrao} alt={item.nome} className={styles.imagemItem} />
                                    <div className={styles.infoItem}>
                                        <h3>{item.nome}</h3>
                                        <p>{formatarPreco(item.preco)} / unidade</p>
                                    </div>
                                    <div className={styles.quantidadeItem}>
                                        <label htmlFor={`qtd-${item.id_produto}`}>Qtd:</label>
                                        <input id={`qtd-${item.id_produto}`} type="number" min="1" value={item.quantity} onChange={(e) => updateItemQuantity(item.id_produto, parseInt(e.target.value, 10) || 1)} />
                                    </div>
                                    <p className={styles.subtotalItem}>{formatarPreco(calcularSubtotalItem(item))}</p>
                                    <button onClick={() => removeFromCart(item.id_produto)} className={styles.botaoRemover} title="Remover item">&times;</button>
                                </div>
                            ))}
                        </div>

                        <div className={styles.resumoCarrinho}>
                            <h2>Resumo da Compra</h2>
                            
                            <div className={styles.campoFormulario}>
                                <label htmlFor="observacao">Observações:</label>
                                <textarea id="observacao" value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Ex: tirar a cebola, ponto da carne, etc." />
                            </div>

                            <div className={styles.campoFormulario}>
                                <label htmlFor="formaPagamento">Forma de Pagamento:</label>
                                <select id="formaPagamento" value={idFormaPagamento} onChange={(e) => setIdFormaPagamento(e.target.value)}>
                                    <option value="1">Dinheiro</option>
                                    <option value="2">Cartão de Crédito</option>
                                    <option value="3">Cartão de Débito</option>
                                    <option value="4">Pix</option>
                                </select>
                            </div>

                            <div className={styles.linhaResumo}>
                                <span>Subtotal</span>
                                <span>{formatarPreco(calcularTotalCarrinho())}</span>
                            </div>
                            <div className={styles.linhaResumo}>
                                <span>Taxa de Entrega (exemplo)</span>
                                <span>{formatarPreco(5.00)}</span>
                            </div>
                            <div className={`${styles.linhaResumo} ${styles.total}`}>
                                <span>Total</span>
                                <span>{formatarPreco(calcularTotalCarrinho() + 5.00)}</span>
                            </div>
                            <button onClick={handleFinalizarCompra} className={styles.botaoFinalizar} disabled={loading}>
                                {loading ? 'Processando...' : 'Finalizar Compra'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}