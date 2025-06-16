
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MeusProdutos.module.css';
import CabecalhoRestaurante from '../../../components/CabecalhoRestaurante/CabecalhoRestaurante.jsx';
import imagemProdutoPadrao from '../../../assets/restaure.png';

export default function MeusProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

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

  const fetchMeusProdutos = async () => {
    window.scrollTo({ top: 0 });
    setLoading(true);
    setErro('');
    try {
      const token = await aguardarToken();

      let tentativa = 0;
      let sucesso = false;
      let ultimaMensagem = '';

      while (!sucesso && tentativa < 3) {
        try {
          const response = await timeoutPromise(fetch('http://localhost:3001/api/produtos/meus-produtos', {
            headers: { Authorization: `Bearer ${token}` }
          }));

          const data = await response.json();
          if (!response.ok) throw new Error(data.message || "Erro ao carregar produtos.");
          setProdutos(data);
          sucesso = true;
        } catch (err) {
          tentativa++;
          ultimaMensagem = err.message;
          await new Promise(res => setTimeout(res, 1000));
        }
      }

      if (!sucesso) throw new Error(ultimaMensagem);
    } catch (error) {
      setErro(error.message || "Erro ao buscar produtos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeusProdutos();
  }, []);

  const handleExcluirProduto = async (idProduto) => {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3001/api/produtos/${idProduto}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erro ao excluir produto.");
      }

      alert("Produto excluído com sucesso!");
      setProdutos(produtosAtuais => produtosAtuais.filter(p => p.id_produto !== idProduto));
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditarProduto = (produtoParaEditar) => {
    navigate('/restaurante/criarproduto', { state: { produtoParaEditar } });
  };

  const formatarPreco = (preco) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco);

  return (
    <>
      <CabecalhoRestaurante />
      <div className={styles.container}>
        <h1 className={styles.titulo}>Meus Produtos</h1>

        {loading && <p className={styles.aviso}>Carregando...</p>}
        {erro && <p className={styles.aviso}>{erro}</p>}

        {!loading && !erro && produtos.length === 0 && (
          <div className={styles.semProdutos}>
            <p className={styles.aviso}>Você ainda não cadastrou nenhum produto.</p>
            <button className={styles.botaoCriar} onClick={() => navigate('/restaurante/criarproduto')}>
              Cadastrar Primeiro Produto
            </button>
          </div>
        )}

        {!loading && produtos.length > 0 && (
          <div className={styles.listaProdutos}>
            {produtos.map((produto) => (
              <div key={produto.id_produto} className={styles.cardProduto}>
                <img
                  src={produto.url_imagem ? `http://localhost:3001${produto.url_imagem}` : imagemProdutoPadrao}
                  alt={produto.nome}
                  className={styles.imagemProduto}
                />
                <div className={styles.infoProduto}>
                  <h2 className={styles.nomeProduto}>{produto.nome}</h2>
                  <p className={styles.descricaoProduto}>{produto.descricao}</p>
                  <p className={styles.precoProduto}>{formatarPreco(produto.preco)}</p>
                </div>
                <div className={styles.acoesProduto}>
                  <button className={styles.botaoEditar} onClick={() => handleEditarProduto(produto)}>Editar</button>
                  <button className={styles.botaoExcluir} onClick={() => handleExcluirProduto(produto.id_produto)}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
