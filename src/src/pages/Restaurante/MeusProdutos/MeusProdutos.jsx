// src/pages/Restaurante/MeusProdutos/MeusProdutos.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './MeusProdutos.module.css';
import CabecalhoRestaurante from '../../../components/CabecalhoRestaurante/CabecalhoRestaurante.jsx';
import imagemProdutoPadrao from '../../../assets/restaure.png';

export default function MeusProdutos() {
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const navigate = useNavigate();

    const fetchMeusProdutos = useCallback(async () => {
        setLoading(true); setErro('');
        
        // ✅ CORREÇÃO 1: Usando a chave correta 'token'
        const token = localStorage.getItem('token');
        if (!token) {
            setErro("Autenticação necessária."); setLoading(false);
            setTimeout(() => navigate('/restaurante/login'), 2000); return;
        }
        try {
            const response = await fetch('http://localhost:3001/api/produtos/meus-produtos', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) { throw new Error(data.message || "Erro ao carregar produtos."); }
            setProdutos(data);
        } catch (error) { 
            setErro(error.message);
        } finally { 
            setLoading(false); 
        }
    }, [navigate]);

    useEffect(() => { fetchMeusProdutos(); }, [fetchMeusProdutos]);

    const handleExcluirProduto = async (idProduto) => {
        if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;
        setLoading(true); 
        
        // ✅ CORREÇÃO 1: Usando a chave correta 'token'
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3001/api/produtos/${idProduto}`, {
                method: 'DELETE', 
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            // ✅ MELHORIA: Lida com respostas sem corpo JSON (ex: status 204)
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || `Erro ao excluir produto.`);
            }
            
            alert("Produto excluído com sucesso!");
            // Remove o produto da lista na tela sem precisar recarregar a página
            setProdutos(produtosAtuais => produtosAtuais.filter(p => p.id_produto !== idProduto));

        } catch (error) { 
            alert(error.message);
        } finally { 
            setLoading(false); 
        }
    };

    const handleEditarProduto = (produtoParaEditar) => {
        navigate(`/restaurante/criarproduto`, { state: { produtoParaEditar: produtoParaEditar } });
    };

    const formatarPreco = (preco) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco);

    if (loading) return <p>Carregando...</p>; 
    if (erro) return <p>{erro}</p>;

    return (
        <>
            <CabecalhoRestaurante />
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.titulo}>Meus Produtos</h1>
 
                </div>
                
                {produtos.length === 0 ? (
                    <div className={styles.semProdutos}>
                        <p className={styles.aviso}>Você ainda não cadastrou nenhum produto.</p>
                        <button className={styles.botaoCriar} onClick={() => navigate('/restaurante/criarproduto')}>
                            Cadastrar Primeiro Produto
                        </button>
                    </div>
                ) : (
                    <div className={styles.listaProdutos}>
                        {produtos.map(produto => (
                            <div key={produto.id_produto} className={styles.cardProduto}>
                                {/* ✅ CORREÇÃO 2: Usando o nome de campo correto 'url_imagem' */}
                                <img src={produto.url_imagem ? `http://localhost:3001${produto.url_imagem}` : imagemProdutoPadrao} alt={produto.nome} className={styles.imagemProduto}/>
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