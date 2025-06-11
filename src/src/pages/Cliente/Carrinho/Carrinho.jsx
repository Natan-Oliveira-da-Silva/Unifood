
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
          } catch {
            setTaxaFrete(0);
          }
        }
      } else {
        setTaxaFrete(0);
      }
    };
    fetchTaxaFrete();
  }, [cartItems]);

  const calcularSubtotalItem = (item) => item.preco * item.quantity;
  const calcularSubtotalCarrinho = () => cartItems.reduce((total, item) => total + calcularSubtotalItem(item), 0);
  const calcularTotalCarrinho = () => calcularSubtotalCarrinho() + (Number(taxaFrete) || 0);

  const formatarPreco = (preco) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco || 0);

  const timeoutPromise = (promise, ms = 10000) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Tempo de resposta excedido.")), ms))
    ]);
  };

  const aguardarToken = (tentativas = 5, intervalo = 500) => {
    return new Promise((resolve, reject) => {
      let count = 0;
      const checar = () => {
        const token = localStorage.getItem('token');
        if (token) return resolve(token);
        if (++count >= tentativas) return reject(new Error("Token não encontrado."));
        setTimeout(checar, intervalo);
      };
      checar();
    });
  };

  const handleFinalizarCompra = async () => {
    setLoading(true);
    setErro('');

    if (cartItems.length === 0) {
      setErro("Seu carrinho está vazio.");
      setLoading(false);
      return;
    }

    try {
      const token = await aguardarToken();
      const pedidoParaEnviar = {
        id_restaurante: cartItems[0]?.id_restaurante,
        id_forma_pagamento: parseInt(idFormaPagamento),
        observacao,
    itens: cartItems.map(item => ({
        id_produto: item.id_produto,
        quantidade: item.quantity,
        preco: item.preco 
    })),
    taxa_frete: taxaFrete  
      };

      let tentativa = 0;
      let sucesso = false;
      let ultimaMensagem = '';

      while (!sucesso && tentativa < 3) {
        try {
          const response = await timeoutPromise(fetch(`${API_URL}/api/pedidos`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(pedidoParaEnviar)
          }));

          const data = await response.json();
          if (!response.ok) throw new Error(data.message || "Erro ao finalizar pedido.");

          sucesso = true;
          alert("Pedido realizado com sucesso!");
          clearCart();
          navigate('/cliente/consultarpedidos');
        } catch (err) {
          tentativa++;
          ultimaMensagem = err.message;
          await new Promise(res => setTimeout(res, 1000));
        }
      }

      if (!sucesso) throw new Error(ultimaMensagem);
    } catch (error) {
      setErro(error.message || "Erro inesperado. Tente novamente.");
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
                const imageUrl = item.url_imagem ? `${API_URL}${item.url_imagem}` : imagemProdutoPadrao;
                return (
                  <div key={item.id_produto} className={styles.itemCarrinho}>
                    <img src={imageUrl} alt={item.nome} className={styles.imagemItem} onError={(e) => e.target.src = imagemProdutoPadrao} />
                    <div className={styles.infoItem}>
                      <h3>{item.nome}</h3>
                      <p>{formatarPreco(item.preco)} / unidade</p>
                    </div>
                    <div className={styles.quantidadeItem}>
                      <label>Qtd:</label>
                      <input type="number" min="1" value={item.quantity} onChange={(e) => updateItemQuantity(item.id_produto, parseInt(e.target.value, 10) || 1)} />
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
                <label>Observações:</label>
                <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Ex: tirar a cebola, ponto da carne, etc." />
              </div>
              <div className={styles.campoFormulario}>
                <label>Forma de Pagamento:</label>
                <select value={idFormaPagamento} onChange={(e) => setIdFormaPagamento(e.target.value)}>
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
