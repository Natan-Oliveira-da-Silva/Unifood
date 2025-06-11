import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import styles from './ProdutoItem.module.css';
import imagemProdutoPadrao from '../../assets/restaure.png';

export default function ProdutoItem({ produto }) {
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        if (quantity > 0) {
            addToCart(produto, quantity);
        }
    };

    const formatarPreco = (preco) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco);
    };

    return (
        <li className={styles.itemProduto}>
            <img 
                src={produto.url_imagem ? `http://localhost:3001${produto.url_imagem}` : imagemProdutoPadrao} 
                alt={produto.nome} 
                className={styles.imagemProduto}
                onError={(e) => { e.target.onerror = null; e.target.src = imagemProdutoPadrao; }}
            />
            <div className={styles.infoProduto}>
                <h3 className={styles.nomeProduto}>{produto.nome}</h3>
                <p className={styles.descricaoProduto}>{produto.descricao}</p>
                <p className={styles.precoProduto}>{formatarPreco(produto.preco)}</p>
            </div>
            <div className={styles.acoesProduto}>
                <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                    className={styles.inputQuantidade}
                    aria-label="Quantidade"
                />
                <button onClick={handleAddToCart} className={styles.botaoAdicionar}>
                    Adicionar
                </button>
            </div>
        </li>
    );
}
