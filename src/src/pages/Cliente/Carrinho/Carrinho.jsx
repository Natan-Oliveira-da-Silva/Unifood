// src/pages/Cliente/Carrinho/Carrinho.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import styles from './Carrinho.module.css';
import CabecalhoCliente from '../../../components/CabecalhoCliente/CabecalhoCliente.jsx';
import imagemProdutoPadrao from '../../../assets/restaure.png';

export default function Carrinho() {
    // Usando nosso hook useCart para pegar o estado e as funções do carrinho
    const { cartItems, removeFromCart, updateItemQuantity, clearCart } = useCart();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');

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

        const subtotal = calcularTotalCarrinho();
        if (subtotal === 0) {
            setErro("Seu carrinho está vazio. Adicione itens para continuar.");
            setLoading(false);
            return;
        }

        const id_restaurante = cartItems[0]?.id_restaurante;
        const taxa_frete = id_restaurante ? 5.00 : 0; // Taxa de frete de exemplo
        
        const pedidoData = {
            itens: cartItems,
            id_restaurante: id_restaurante,
            subtotal: subtotal,
            taxa_frete: taxa_frete,
            valor_total: subtotal + taxa_frete
            // Como combinado, estamos usando uma versão simplificada
        };

        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch('http://localhost:3001/api/pedidos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(pedidoData)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Não foi possível finalizar o pedido.");
            }
            
            alert("Pedido realizado com sucesso!");
            clearCart();
            navigate('/cliente/consultarpedidos');

        } catch (error) {
            setErro(error.message);
        } finally {
            setLoading(false);
        }
    };

    // A ESTRUTURA JSX COMPLETA VAI AQUI DENTRO DO RETURN
    return (
        <>
            <CabecalhoCliente />
            <div className={styles.container}>
                <h1 className={styles.titulo}>Meu Carrinho</h1>

                {erro && <p className={styles.erroGeral}>{erro}</p>}

                {cartItems.length === 0 ? (
                    // --- TELA PARA CARRINHO VAZIO ---
                    <div className={styles.carrinhoVazio}>
                        <p>Seu carrinho está vazio.</p>
                        <button onClick={() => navigate('/cliente/inicio')}>
                            Ver Restaurantes
                        </button>
                    </div>
                ) : (
                    // --- TELA PARA CARRINHO COM ITENS ---
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
                                        <input
                                            id={`qtd-${item.id_produto}`}
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItemQuantity(item.id_produto, parseInt(e.target.value, 10) || 0)}
                                        />
                                    </div>
                                    <p className={styles.subtotalItem}>
                                        {formatarPreco(calcularSubtotalItem(item))}
                                    </p>
                                    <button onClick={() => removeFromCart(item.id_produto)} className={styles.botaoRemover} title="Remover item">
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className={styles.resumoCarrinho}>
                            <h2>Resumo da Compra</h2>
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