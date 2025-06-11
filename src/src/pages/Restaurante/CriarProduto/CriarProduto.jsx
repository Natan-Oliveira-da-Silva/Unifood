
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './CriarProduto.module.css';
import CabecalhoRestaurante from '../../../components/CabecalhoRestaurante/CabecalhoRestaurante';

export default function CriarProduto() {
  const navigate = useNavigate();
  const location = useLocation();
  const produtoParaEditar = location.state?.produtoParaEditar;
  const isEditMode = Boolean(produtoParaEditar);

  const [nome, setNome] = useState(produtoParaEditar?.nome || '');
  const [descricao, setDescricao] = useState(produtoParaEditar?.descricao || '');
  const [preco, setPreco] = useState(produtoParaEditar?.preco?.toString() || '');
  const [imagemProduto, setImagemProduto] = useState(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSuccessMessage('');
    window.scrollTo({ top: 0 });
    setLoading(true);

    if (!nome || !preco) {
      setErro("Nome e Preço são obrigatórios.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('descricao', descricao);
    formData.append('preco', preco);
    if (imagemProduto) formData.append('imagem', imagemProduto);

    try {
      const token = await aguardarToken();

      let tentativa = 0;
      let sucesso = false;
      let ultimaMensagem = '';

      const method = isEditMode ? 'PUT' : 'POST';
      const apiUrl = isEditMode
        ? `http://localhost:3001/api/produtos/${produtoParaEditar.id_produto}`
        : 'http://localhost:3001/api/produtos';

      while (!sucesso && tentativa < 3) {
        try {
          const response = await timeoutPromise(fetch(apiUrl, {
            method,
            headers: { Authorization: `Bearer ${token}` },
            body: formData
          }));

          const data = await response.json();
          if (!response.ok) throw new Error(data.message || "Erro no cadastro.");
          setSuccessMessage(data.message || "Produto salvo com sucesso!");

          if (!isEditMode) {
            setNome('');
            setDescricao('');
            setPreco('');
            setImagemProduto(null);
            setPreviewImagem(null);
          }

          sucesso = true;
          setTimeout(() => navigate('/restaurante/meusprodutos'), 3000);
        } catch (err) {
          tentativa++;
          ultimaMensagem = err.message;
          await new Promise(res => setTimeout(res, 1000));
        }
      }

      if (!sucesso) throw new Error(ultimaMensagem);
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      setErro(error.message || 'Erro inesperado. Tente novamente.');
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
