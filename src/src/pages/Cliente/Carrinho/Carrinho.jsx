// src/pages/Cliente/Carrinho/Carrinho.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import styles from './Carrinho.module.css';
import CabecalhoCliente from '../../../components/CabecalhoCliente/CabecalhoCliente.jsx';
import imagemProdutoPadrao from '../../../assets/restaure.png';

export default function Carrinho() {
    // Usando nosso hook useCart para pegar o estado e as funções do carrinho
    const { cartItems, removeFromCart, updateItemQuantity } = useCart();
    const navigate = useNavigate();

    const calcularSubtotal = (item) => {
        return item.preco * item.quantity;
    };

    const calcularTotal = () => {
        return cartItems.reduce((total, item) => total + calcularSubtotal(item), 0);
    };

    const formatarPreco = (preco) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco);
    };

    const handleFinalizarCompra = () => {
        // Por enquanto, esta função será um placeholder.
        // No futuro, ela iniciaria o processo de checkout.
        alert('Funcionalidade "Finalizar Compra" a ser implementada!\n\nPróximos passos:\n1. Criar um pedido no backend.\n2. Integrar com um meio de pagamento.\n3. Limpar o carrinho após a confirmação.');
    };

    return (
        <>
            <CabecalhoCliente />
            <div className={styles.container}>
                <h1 className={styles.titulo}>Meu Carrinho</h1>

                {cartItems.length === 0 ? (
                    // --- EXIBIÇÃO PARA CARRINHO VAZIO ---
                    <div className={styles.carrinhoVazio}>
                        <p>Seu carrinho está vazio.</p>
                        <button onClick={() => navigate('/cliente/inicio')}>
                            Ver Restaurantes
                        </button>
                    </div>
                ) : (
                    // --- EXIBIÇÃO PARA CARRINHO COM ITENS ---
                    <div className={styles.carrinhoContainer}>
                        <div className={styles.listaItens}>
                            {cartItems.map(item => (
                                <div key={item.id_produto} className={styles.itemCarrinho}>
                                    <img src={item.url_imagem_principal || imagemProdutoPadrao} alt={item.nome} className={styles.imagemItem} />
                                    <div className={styles.infoItem}>
                                        <h3>{item.nome}</h3>
                                        <p>{formatarPreco(item.preco)}</p>
                                    </div>
                                    <div className={styles.quantidadeItem}>
                                        <label>Qtd:</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItemQuantity(item.id_produto, parseInt(e.target.value, 10))}
                                        />
                                    </div>
                                    <p className={styles.subtotalItem}>
                                        {formatarPreco(calcularSubtotal(item))}
                                    </p>
                                    <button onClick={() => removeFromCart(item.id_produto)} className={styles.botaoRemover}>
                                        &times; {/* "X" para remover */}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className={styles.resumoCarrinho}>
                            <h2>Resumo da Compra</h2>
                            <div className={styles.linhaResumo}>
                                <span>Subtotal</span>
                                <span>{formatarPreco(calcularTotal())}</span>
                            </div>
                            <div className={styles.linhaResumo}>
                                <span>Taxa de Entrega</span>
                                <span>A calcular</span>
                            </div>
                            <div className={`${styles.linhaResumo} ${styles.total}`}>
                                <span>Total</span>
                                <span>{formatarPreco(calcularTotal())}</span>
                            </div>
                            <button onClick={handleFinalizarCompra} className={styles.botaoFinalizar}>
                                Finalizar Compra
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}