// src/pages/Restaurante/MeusProdutos/MeusProdutos.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
        const token = localStorage.getItem('authToken');
        if (!token) {
            setErro("Autenticação necessária."); setLoading(false);
            setTimeout(() => navigate('/restaurante/login'), 2000); return;
        }
        try {
            const response = await fetch('http://localhost:3001/api/produtos/meus-produtos', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) { setErro(data.message || "Erro ao carregar produtos."); setProdutos([]); }
            else { setProdutos(data); }
        } catch (error) { setErro("Falha ao conectar com o servidor.");
        } finally { setLoading(false); }
    }, [navigate]);

    useEffect(() => { fetchMeusProdutos(); }, [fetchMeusProdutos]);

    const handleExcluirProduto = async (idProduto) => {
        if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;
        setLoading(true); // Bloqueia a UI para evitar cliques duplos
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`http://localhost:3001/api/produtos/${idProduto}`, {
                method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) {
                alert(data.message || `Erro ao excluir produto.`);
            } else {
                alert(data.message || "Produto excluído com sucesso!");
                setProdutos(produtosAtuais => produtosAtuais.filter(p => p.id_produto !== idProduto));
            }
        } catch (error) { alert("Falha de conexão ao excluir.");
        } finally { setLoading(false); }
    };

    const handleEditarProduto = (produtoParaEditar) => {
        navigate(`/restaurante/criarproduto`, { state: { produtoParaEditar: produtoParaEditar } });
    };

    const formatarPreco = (preco) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco);

    if (loading) { /* ... renderiza loading ... */ }
    if (erro) { /* ... renderiza erro ... */ }

    return (
        <>
            <CabecalhoRestaurante />
            <div className={styles.container}>
                <h1 className={styles.titulo}>Meus Produtos</h1>
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
                                <img src={produto.url_imagem_principal || imagemProdutoPadrao} alt={produto.nome} className={styles.imagemProduto}/>
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