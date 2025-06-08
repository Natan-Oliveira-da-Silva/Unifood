import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CadastrarDetalhesRestaurante.module.css';
import CabecalhoRestaurante from '../../../components/CabecalhoRestaurante/CabecalhoRestaurante';

export default function CadastrarDetalhesRestaurante() {
    const navigate = useNavigate();

    // Estados para os campos do formulário
    const [isEditMode, setIsEditMode] = useState(false);
    const [nome, setNome] = useState('');
    const [idCozinha, setIdCozinha] = useState('');
    const [taxaFrete, setTaxaFrete] = useState('');
    const [imagemLogo, setImagemLogo] = useState(null);
    const [previewImagem, setPreviewImagem] = useState(null);
    const [enderecoCep, setEnderecoCep] = useState('');
    const [enderecoLogradouro, setEnderecoLogradouro] = useState('');
    const [enderecoNumero, setEnderecoNumero] = useState('');
    const [enderecoComplemento, setEnderecoComplemento] = useState('');
    const [enderecoBairro, setEnderecoBairro] = useState('');
    const [enderecoCidade, setEnderecoCidade] = useState('');
    const [enderecoEstado, setEnderecoEstado] = useState('');

    const [cozinhas, setCozinhas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setErro("Autenticação necessária. Por favor, faça login.");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            // Limpa erros antigos ao buscar dados novamente
            setErro(''); 
            
            try {
                const [cozinhasRes, restauranteRes] = await Promise.all([
                    fetch('http://localhost:3001/api/cozinhas'),
                    fetch('http://localhost:3001/api/restaurantes/meu-restaurante', {
                        headers: { 
                            'Authorization': `Bearer ${token}` 
                        }
                    })
                ]);

                if (!cozinhasRes.ok) throw new Error('Não foi possível carregar os tipos de cozinha.');
                const cozinhasData = await cozinhasRes.json();
                setCozinhas(cozinhasData);

                // --- LÓGICA CORRIGIDA AQUI ---
                if (restauranteRes.ok) {
                    // Se a resposta for OK (200), significa que o restaurante EXISTE.
                    // Entramos em modo de edição e preenchemos o formulário.
                    const rData = await restauranteRes.json();
                    setIsEditMode(true);
                    setNome(rData.nome || '');
                    setIdCozinha(rData.id_cozinha?.toString() || '');
                    setTaxaFrete(rData.taxa_frete?.toString() || '');
                    setEnderecoCep(rData.endereco_cep || '');
                    setEnderecoLogradouro(rData.endereco_logradouro || '');
                    setEnderecoNumero(rData.endereco_numero || '');
                    setEnderecoComplemento(rData.endereco_complemento || '');
                    setEnderecoBairro(rData.endereco_bairro || '');
                    setEnderecoCidade(rData.endereco_cidade || '');
                    setEnderecoEstado(rData.endereco_estado || '');
                    if (rData.url_imagem_logo) {
                        setPreviewImagem(`http://localhost:3001${rData.url_imagem_logo}`);
                    }
                } else if (restauranteRes.status === 404) {
                    // Se for 404, significa que o restaurante NÃO EXISTE.
                    // Isso NÃO é um erro. Apenas deixamos o formulário no modo de criação.
                    console.log("Nenhum restaurante encontrado. Formulário em modo de criação.");
                    setIsEditMode(false);
                } else {
                    // Se for qualquer outro erro (500, 401, etc.), aí sim mostramos a mensagem.
                    const errorData = await restauranteRes.json();
                    throw new Error(errorData.message || "Erro ao buscar dados do restaurante.");
                }

            } catch (error) {
                setErro(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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
        setErro('');
        setSuccessMessage('');
        setLoading(true);

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('id_cozinha', idCozinha);
        // ... (resto do seu código do handleSubmit, que já está correto) ...
        formData.append('taxa_frete', taxaFrete);
        formData.append('endereco_cep', enderecoCep);
        formData.append('endereco_logradouro', enderecoLogradouro);
        formData.append('endereco_numero', enderecoNumero);
        formData.append('endereco_complemento', enderecoComplemento);
        formData.append('endereco_bairro', enderecoBairro);
        formData.append('endereco_cidade', enderecoCidade);
        formData.append('endereco_estado', enderecoEstado);

        if (imagemLogo) {
            formData.append('imagemLogo', imagemLogo);
        }

        const url = isEditMode 
            ? `http://localhost:3001/api/restaurantes/meu-restaurante` 
            : 'http://localhost:3001/api/restaurantes';
        
        const method = isEditMode ? 'PUT' : 'POST';

        try {
            const headers = new Headers();
            headers.append('Authorization', `Bearer ${token}`);

            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: formData,
            });
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Erro ${response.status}`);
            }

            setSuccessMessage(data.message);
            // Redireciona para o dashboard após o sucesso
            setTimeout(() => navigate('/restaurante/inicio'), 2000);

        } catch (error) {
            setErro(error.message);
        } finally {
            setLoading(false);
        }
    };

    // O return com o JSX permanece o mesmo
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
                    {/* ... seu formulário JSX que já está correto ... */}
                    <div className={styles.inputs}>
                        <input className={styles.texto} type="text" placeholder="Nome do Restaurante*" value={nome} onChange={(e) => setNome(e.target.value)} required disabled={loading} />
                        
                        <select className={styles.texto} value={idCozinha} onChange={(e) => setIdCozinha(e.target.value)} required disabled={loading || cozinhas.length === 0}>
                            <option value="">{loading ? "Carregando..." : "Tipo de Cozinha*"}</option>
                            {cozinhas.map(cozinha => (
                                <option key={cozinha.id_cozinha} value={cozinha.id_cozinha}>{cozinha.nome}</option>
                            ))}
                        </select>
                        
                        <div className={styles.campoGrupoUpload}>
                            <label htmlFor="imagemLogo">Logo do Restaurante:</label>
                            {previewImagem && <img src={previewImagem} alt="Preview do logo" className={styles.previewLogo} />}
                            <input type="file" id="imagemLogo" onChange={handleImagemChange} accept="image/*" disabled={loading} />
                            {isEditMode && <p className={styles.aviso}>Selecione uma nova imagem apenas se desejar substituí-la.</p>}
                        </div>

                        <input className={styles.texto} type="number" placeholder="Taxa de Frete (R$)" value={taxaFrete} onChange={(e) => setTaxaFrete(e.target.value)} step="0.01" min="0" disabled={loading} />
                        
                        <h2 className={styles.subtituloForm}>Endereço</h2>
                        <input className={styles.texto} type="text" placeholder="CEP*" value={enderecoCep} onChange={(e) => setEnderecoCep(e.target.value)} required disabled={loading} />
                        <input className={styles.texto} type="text" placeholder="Logradouro*" value={enderecoLogradouro} onChange={(e) => setEnderecoLogradouro(e.target.value)} required disabled={loading} />
                        <input className={styles.texto} type="text" placeholder="Número*" value={enderecoNumero} onChange={(e) => setEnderecoNumero(e.target.value)} required disabled={loading} />
                        <input className={styles.texto} type="text" placeholder="Complemento" value={enderecoComplemento} onChange={(e) => setEnderecoComplemento(e.target.value)} disabled={loading} />
                        <input className={styles.texto} type="text" placeholder="Bairro*" value={enderecoBairro} onChange={(e) => setEnderecoBairro(e.target.value)} required disabled={loading} />
                        <input className={styles.texto} type="text" placeholder="Cidade*" value={enderecoCidade} onChange={(e) => setEnderecoCidade(e.target.value)} required disabled={loading} />
                        <input className={styles.texto} type="text" placeholder="Estado (UF)*" value={enderecoEstado} onChange={(e) => setEnderecoEstado(e.target.value)} required maxLength="2" disabled={loading} />

                        <button type="submit" className={styles.criar} disabled={loading || successMessage}>
                            {loading ? (isEditMode ? 'Salvando...' : 'Cadastrando...') : (isEditMode ? 'Salvar Alterações' : 'Cadastrar Restaurante')}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}