import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import styles from './Carrinho.module.css';
import CabecalhoCliente from '../../../components/CabecalhoCliente/CabecalhoCliente.jsx';
import imagemProdutoPadrao from '../../../assets/restaure.png';

const API_URL = 'http://localhost:3001';

export default function Carrinho() {
    const { cartItems, removeFromCart, updateItemQuantity, clearCart } = useCart();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [observacao, setObservacao] = useState('');
    const [idFormaPagamento, setIdFormaPagamento] = useState('1');
    const [taxaFrete, setTaxaFrete] = useState(0);

    useEffect(() => {
        const fetchTaxaFrete = async () => {
            if (cartItems.length > 0) {
                const idRestaurante = cartItems[0].id_restaurante;
                if (idRestaurante) {
                    try {
                        const response = await fetch(`${API_URL}/api/restaurantes/${idRestaurante}`);
                        if (response.ok) {
                            const data = await response.json();
                            setTaxaFrete(data.taxa_frete);
                        }
                    } catch (error) {
                        console.error("Erro ao buscar taxa de frete:", error);
                        setTaxaFrete(0);
                    }
                }
            } else {
                setTaxaFrete(0); // Zera o frete se o carrinho estiver vazio
            }
        };
        fetchTaxaFrete();
    }, [cartItems]);

    const calcularSubtotalItem = (item) => {
        return item.preco * item.quantity;
    };
    
    const calcularSubtotalCarrinho = () => {
        return cartItems.reduce((total, item) => total + calcularSubtotalItem(item), 0);
    };

    const calcularTotalCarrinho = () => {
        const subtotal = calcularSubtotalCarrinho();
        return subtotal + (Number(taxaFrete) || 0);
    };

    const formatarPreco = (preco) => {
        if (isNaN(preco)) return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(0);
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco);
    };

    // ✅ --- FUNÇÃO FINALIZAR COMPRA COMPLETA --- ✅
    const handleFinalizarCompra = async () => {
        setLoading(true);
        setErro('');

        if (cartItems.length === 0) {
            setErro("Seu carrinho está vazio.");
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setErro("Autenticação necessária. Faça o login para continuar.");
            setLoading(false);
            // Opcional: redirecionar para o login
            setTimeout(() => navigate('/cliente/login'), 2500);
            return;
        }

        // Monta o objeto do pedido no formato que o backend espera
        const pedidoParaEnviar = {
            id_restaurante: cartItems[0]?.id_restaurante,
            id_forma_pagamento: parseInt(idFormaPagamento),
            observacao: observacao,
            itens: cartItems.map(item => ({
                id_produto: item.id_produto,
                quantidade: item.quantity
            }))
        };
        
        try {
            const response = await fetch(`${API_URL}/api/pedidos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(pedidoParaEnviar)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Não foi possível finalizar o pedido.");
            }
            
            alert("Pedido realizado com sucesso!");
            clearCart(); // Limpa o carrinho após o sucesso
            navigate('/cliente/consultarpedidos'); // Redireciona para a tela de histórico

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
                        <button onClick={() => navigate('/cliente/inicio')}>Ver Restaurantes</button>
                    </div>
                ) : (
                    <div className={styles.carrinhoContainer}>
                        <div className={styles.listaItens}>
                            {cartItems.map(item => {
                                const imageUrl = item.url_imagem 
                                    ? `${API_URL}${item.url_imagem}` 
                                    : imagemProdutoPadrao;

                                return (
                                    <div key={item.id_produto} className={styles.itemCarrinho}>
                                        <img src={imageUrl} alt={item.nome} className={styles.imagemItem} onError={(e) => e.target.src = imagemProdutoPadrao} />
                                        <div className={styles.infoItem}>
                                            <h3>{item.nome}</h3>
                                            <p>{formatarPreco(item.preco)} / unidade</p>
                                        </div>
                                        <div className={styles.quantidadeItem}>
                                            <label htmlFor={`qtd-${item.id_produto}`}>Qtd:</label>
                                            <input
                                                id={`qtd-${item.id_produto}`}
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItemQuantity(item.id_produto, parseInt(e.target.value, 10) || 1)}
                                            />
                                        </div>
                                        <p className={styles.subtotalItem}>{formatarPreco(calcularSubtotalItem(item))}</p>
                                        <button onClick={() => removeFromCart(item.id_produto)} className={styles.botaoRemover} title="Remover item">&times;</button>
                                    </div>
                                );
                            })}
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
                                <span>{formatarPreco(calcularSubtotalCarrinho())}</span>
                            </div>
                            <div className={styles.linhaResumo}>
                                <span>Taxa de Entrega</span>
                                <span>{formatarPreco(taxaFrete)}</span>
                            </div>
                            <div className={`${styles.linhaResumo} ${styles.total}`}>
                                <span>Total</span>
                                <span>{formatarPreco(calcularTotalCarrinho())}</span>
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