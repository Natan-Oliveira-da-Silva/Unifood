// src/pages/Restaurante/CadastrarDetalhesRestaurante/CadastrarDetalhesRestaurante.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './CadastrarDetalhesRestaurante.module.css';
import CabecalhoRestaurante from '../../../components/CabecalhoRestaurante/CabecalhoRestaurante';

export default function CadastrarDetalhesRestaurante() {
    const navigate = useNavigate();
    const location = useLocation();

    const restauranteParaEditar = location.state?.restauranteParaEditar;
    const isEditMode = Boolean(restauranteParaEditar);

    const [nome, setNome] = useState(restauranteParaEditar?.nome || '');
    const [idCozinha, setIdCozinha] = useState(restauranteParaEditar?.id_cozinha?.toString() || '');
    const [taxaFrete, setTaxaFrete] = useState(restauranteParaEditar?.taxa_frete?.toString() || '');
    const [imagemLogo, setImagemLogo] = useState(null);
    const [previewImagem, setPreviewImagem] = useState(restauranteParaEditar?.url_imagem_logo || null);
    const [enderecoCep, setEnderecoCep] = useState(restauranteParaEditar?.endereco_cep || '');
    const [enderecoLogradouro, setEnderecoLogradouro] = useState(restauranteParaEditar?.endereco_logradouro || '');
    const [enderecoNumero, setEnderecoNumero] = useState(restauranteParaEditar?.endereco_numero || '');
    const [enderecoComplemento, setEnderecoComplemento] = useState(restauranteParaEditar?.endereco_complemento || '');
    const [enderecoBairro, setEnderecoBairro] = useState(restauranteParaEditar?.endereco_bairro || '');
    const [enderecoCidade, setEnderecoCidade] = useState(restauranteParaEditar?.endereco_cidade || '');
    const [enderecoEstado, setEnderecoEstado] = useState(restauranteParaEditar?.endereco_estado || '');
    const [cozinhas, setCozinhas] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [erro, setErro] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchCozinhas = async () => {
            
            setLoading(true);
            try {
                const token = localStorage.getItem('authToken');
                const headers = { 'Content-Type': 'application/json' };
                if (token) { headers['Authorization'] = `Bearer ${token}`; }
                const response = await fetch('http://localhost:3001/api/cozinhas', { headers });
                if (!response.ok) {
                    const errData = await response.json().catch(() => ({ message: 'Falha ao buscar cozinhas.' }));
                    throw new Error(errData.message || 'Falha ao buscar cozinhas');
                }
                const data = await response.json();
                setCozinhas(data);
            } catch (error) {
                setErro(error.message || "Não foi possível carregar a lista de cozinhas.");
            } finally {
                setLoading(false);
            }
        };
        fetchCozinhas();
    }, []);

    const handleImagemChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImagemLogo(file);
            setPreviewImagem(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setErro(''); setSuccessMessage('');

        if (!nome || !idCozinha || !enderecoLogradouro || !enderecoNumero || !enderecoBairro || !enderecoCidade || !enderecoEstado || !enderecoCep) {
            setErro("Por favor, preencha todos os campos obrigatórios (Nome, Cozinha, Endereço completo).");
            setLoading(false); return;
        }

        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('id_cozinha', idCozinha);
        formData.append('taxa_frete', taxaFrete || '0.0');
        formData.append('endereco_cep', enderecoCep);
        formData.append('endereco_logradouro', enderecoLogradouro);
        formData.append('endereco_numero', enderecoNumero);
        formData.append('endereco_complemento', enderecoComplemento || '');
        formData.append('endereco_bairro', enderecoBairro);
        formData.append('endereco_cidade', enderecoCidade);
        formData.append('endereco_estado', enderecoEstado);
        
        if (imagemLogo) {
            formData.append('imagemLogo', imagemLogo);
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            setErro("Usuário não autenticado. Faça login novamente.");
            setLoading(false);
            setTimeout(() => navigate('/restaurante/login'), 2500);
            return;
        }

        const method = isEditMode ? 'PUT' : 'POST';
        const apiUrl = isEditMode
            ? `http://localhost:3001/api/restaurantes/meu-restaurante`
            : 'http://localhost:3001/api/restaurantes';

        try {
            const response = await fetch(apiUrl, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await response.json();
            if (!response.ok) {
                setErro(data.message || `Erro ${response.status} ao ${isEditMode ? 'atualizar' : 'cadastrar'} restaurante.`);
            } else {
                setSuccessMessage(`Restaurante ${isEditMode ? 'atualizado' : 'cadastrado'} com sucesso! Redirecionando...`);
                setTimeout(() => { navigate('/restaurante/inicio'); }, 2000);
            }
        } catch (error) {
            setErro("Falha ao conectar com o servidor. Verifique sua conexão e tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <CabecalhoRestaurante />
            <div className={styles.paginaContainer}>
                <h1 className={styles.tituloPrincipal}>
                    {isEditMode ? "Editar Detalhes do Restaurante" : "Cadastrar Detalhes do Restaurante"}
                </h1>
                
                {erro && <p className={styles.mensagemErro}>{erro}</p>}
                {successMessage && <p className={styles.mensagemSucesso}>{successMessage}</p>}

                <form onSubmit={handleSubmit} className={styles.formEstiloProjeto}>

                    <div className={styles.inputs}>
                        <input className={styles.texto} type="text" placeholder="Nome do Restaurante*" value={nome} onChange={(e) => setNome(e.target.value)} required disabled={loading} />
                        <select className={styles.texto} value={idCozinha} onChange={(e) => setIdCozinha(e.target.value)} required disabled={loading || cozinhas.length === 0}>
                            <option value="">{loading && cozinhas.length === 0 && !idCozinha ? "Carregando..." : "Tipo de Cozinha*"}</option>
                            {cozinhas.map(cozinha => ( <option key={cozinha.id_cozinha} value={cozinha.id_cozinha}>{cozinha.nome}</option> ))}
                        </select>
                        
                        <div className={styles.campoGrupoUpload}>
                            <label htmlFor="imagemLogo">Logo do Restaurante {isEditMode ? '(opcional)' : ''}:</label>
                            {previewImagem && <img src={previewImagem} alt="Preview do logo" className={styles.previewLogo} />}
                            <input type="file" id="imagemLogo" onChange={handleImagemChange} accept="image/*" disabled={loading} />
                            {isEditMode && !imagemLogo && <p className={styles.aviso}>Deixe em branco para manter a imagem atual.</p>}
                        </div>

                        <input className={styles.texto} type="number" placeholder="Taxa de Frete (R$) (Ex: 5.00)" value={taxaFrete} onChange={(e) => setTaxaFrete(e.target.value)} step="0.01" min="0" disabled={loading} />
                        
                        <h2 className={styles.subtituloForm}>Endereço</h2>
                        <input className={styles.texto} type="text" placeholder="CEP*" value={enderecoCep} onChange={(e) => setEnderecoCep(e.target.value)} required disabled={loading} />
                        <input className={styles.texto} type="text" placeholder="Logradouro*" value={enderecoLogradouro} onChange={(e) => setEnderecoLogradouro(e.target.value)} required disabled={loading} />
                        <input className={styles.texto} type="text" placeholder="Número*" value={enderecoNumero} onChange={(e) => setEnderecoNumero(e.target.value)} required disabled={loading} />
                        <input className={styles.texto} type="text" placeholder="Complemento" value={enderecoComplemento} onChange={(e) => setEnderecoComplemento(e.target.value)} disabled={loading} />
                        <input className={styles.texto} type="text" placeholder="Bairro*" value={enderecoBairro} onChange={(e) => setEnderecoBairro(e.target.value)} required disabled={loading} />
                        <input className={styles.texto} type="text" placeholder="Cidade*" value={enderecoCidade} onChange={(e) => setEnderecoCidade(e.target.value)} required disabled={loading} />
                        <input className={styles.texto} type="text" placeholder="Estado (UF)* (Ex: BA)" value={enderecoEstado} onChange={(e) => setEnderecoEstado(e.target.value)} required maxLength="2" disabled={loading} />

                        <button type="submit" className={styles.criar} disabled={loading || successMessage !== ''}>
                            {loading ? (isEditMode ? 'Salvando...' : 'Cadastrando...') : (isEditMode ? 'Salvar Alterações' : 'Cadastrar Restaurante')}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}