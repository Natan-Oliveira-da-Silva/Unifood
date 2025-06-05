
import React, { useState } from 'react';
import styles from './CriarProduto.module.css';
import CabecalhoRestaurante from '../../../components/CabecalhoRestaurante/CabecalhoRestaurante.jsx';

export default function CriarProduto() {
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [preco, setPreco] = useState('');
    const [imagemProduto, setImagemProduto] = useState(null);
    const [previewImagem, setPreviewImagem] = useState(null); 

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
            // O nome do campo 'imagemProduto' deve corresponder ao que o multer espera
            formData.append('imagemProduto', imagemProduto);
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            setErro("Autenticação necessária."); setLoading(false); return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/produtos', {
                method: 'POST',
                headers: {
                    // NÃO defina 'Content-Type', o navegador faz isso para FormData
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (!response.ok) {
                setErro(data.message || `Erro ${response.status} ao criar o produto.`);
            } else {
                setSuccessMessage(data.message || "Produto criado com sucesso!");
                
                // Limpa o formulário
                setNome(''); setDescricao(''); setPreco('');
                setImagemProduto(null); setPreviewImagem(null);
                
                // desaparecer com a msg de sucesso após alguns segundos
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            setErro("Falha ao conectar com o servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <CabecalhoRestaurante />
            <div className={styles.paginaContainer}>
                <h1 className={styles.titulo}>Criar Produto</h1>
                <p className={styles.instrucao}>Adicione um novo produto ao seu catálogo.</p>

                {erro && <p className={styles.mensagemErro}>{erro}</p>}
                {successMessage && <p className={styles.mensagemSucesso}>{successMessage}</p>}

                <form onSubmit={handleSubmit} className={styles.formEstiloProjeto}>
                    <div className={styles.inputs}>
                        <input className={styles.texto} type="text" placeholder="Nome do Produto*" value={nome} onChange={(e) => setNome(e.target.value)} required disabled={loading} />
                        <textarea className={styles.textoArea} placeholder="Descrição do Produto" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows="4" disabled={loading}></textarea>
                        
                        <div className={styles.campoGrupoUpload}>
                            <label htmlFor="imagemProduto">Foto do Produto:</label>
                            {previewImagem && <img src={previewImagem} alt="Preview do produto" className={styles.previewLogo} />}
                            <input type="file" id="imagemProduto" onChange={handleImagemChange} accept="image/*" disabled={loading} />
                        </div>
                        
                        <input className={styles.texto} type="number" placeholder="Preço (R$)*" value={preco} onChange={(e) => setPreco(e.target.value)} required step="0.01" min="0" disabled={loading} />
                        
                        <button type="submit" className={styles.criar} disabled={loading}>
                            {loading ? 'Criando...' : 'Criar Produto'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}