// src/pages/Restaurante/CriarProduto/CriarProduto.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './CriarProduto.module.css';
import CabecalhoRestaurante from '../../../components/CabecalhoRestaurante/CabecalhoRestaurante';

export default function CriarProduto() {
    const navigate = useNavigate();
    const location = useLocation();

    // Sua lógica para edição está ótima!
    const produtoParaEditar = location.state?.produtoParaEditar;
    const isEditMode = Boolean(produtoParaEditar);

    const [nome, setNome] = useState(produtoParaEditar?.nome || '');
    const [descricao, setDescricao] = useState(produtoParaEditar?.descricao || '');
    const [preco, setPreco] = useState(produtoParaEditar?.preco?.toString() || '');
    const [imagemProduto, setImagemProduto] = useState(null);
    // ✅ MELHORIA: Usa o caminho completo para o preview da imagem vinda do backend
    const [previewImagem, setPreviewImagem] = useState(
        produtoParaEditar?.url_imagem ? `http://localhost:3001${produtoParaEditar.url_imagem}` : null
    );
    
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleImagemChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImagemProduto(file);
            setPreviewImagem(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setErro(''); setSuccessMessage('');

        if (!nome || !preco) {
            setErro("Nome e Preço são obrigatórios.");
            setLoading(false); return;
        }

        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('descricao', descricao);
        formData.append('preco', preco);
        
        if (imagemProduto) {
            // ✅ CORREÇÃO 1: Usando o nome de campo correto 'imagem'
            formData.append('imagem', imagemProduto);
        }

        // ✅ CORREÇÃO 2: Usando a chave correta 'token'
        const token = localStorage.getItem('token');
        if (!token) {
            setErro("Autenticação necessária. Redirecionando para login...");
            setLoading(false);
            setTimeout(() => navigate('/restaurante/login'), 2500); return;
        }

        const method = isEditMode ? 'PUT' : 'POST';
        const apiUrl = isEditMode
            ? `http://localhost:3001/api/produtos/${produtoParaEditar.id_produto}`
            : 'http://localhost:3001/api/produtos';

        try {
            // ✅ CORREÇÃO 3: Usando a forma mais robusta de enviar o fetch com FormData
            const headers = new Headers();
            headers.append('Authorization', `Bearer ${token}`);

            const response = await fetch(apiUrl, {
                method: method,
                headers: headers,
                body: formData
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `Erro ao ${isEditMode ? 'atualizar' : 'criar'} o produto.`);
            } else {
                setSuccessMessage(data.message || `Produto ${isEditMode ? 'atualizado' : 'criado'} com sucesso!`);
                // Redireciona para uma página de listagem de produtos
                setTimeout(() => navigate('/restaurante/meusprodutos'), 2000); 
            }
        } catch (error) {
            setErro(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <CabecalhoRestaurante />
            <div className={styles.paginaContainer}>
                <h1 className={styles.titulo}>{isEditMode ? 'Editar Produto' : 'Criar Produto'}</h1>
                
                {erro && <p className={styles.mensagemErro}>{erro}</p>}
                {successMessage && <p className={styles.mensagemSucesso}>{successMessage}</p>}

                <form onSubmit={handleSubmit} className={styles.formEstiloProjeto}>
                    <div className={styles.inputs}>
                        <input className={styles.texto} type="text" placeholder="Nome do Produto*" value={nome} onChange={(e) => setNome(e.target.value)} required disabled={loading} />
                        <textarea className={styles.textoArea} placeholder="Descrição do Produto" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows="4" disabled={loading}></textarea>
                        
                        <div className={styles.campoGrupoUpload}>
                            <label htmlFor="imagemProduto">Foto do Produto:</label>
                            {previewImagem && <img src={previewImagem} alt="Preview do produto" className={styles.previewLogo} />}
                            
                            {/* ✅ MELHORIA: Adicionando o atributo 'name' para consistência */}
                            <input type="file" id="imagemProduto" name="imagem" onChange={handleImagemChange} accept="image/*" disabled={loading} />
                            
                            {isEditMode && <p className={styles.aviso}>Selecione uma nova imagem apenas se desejar substituí-la.</p>}
                        </div>
                        
                        <input className={styles.texto} type="number" placeholder="Preço (R$)*" value={preco} onChange={(e) => setPreco(e.target.value)} required step="0.01" min="0" disabled={loading} />
                        
                        <button type="submit" className={styles.criar} disabled={loading || successMessage}>
                            {loading ? (isEditMode ? 'Salvando...' : 'Criando...') : (isEditMode ? 'Salvar Alterações' : 'Criar Produto')}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}