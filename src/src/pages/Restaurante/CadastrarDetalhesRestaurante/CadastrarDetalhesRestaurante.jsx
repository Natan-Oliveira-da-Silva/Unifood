// src/pages/Restaurante/CadastrarDetalhesRestaurante/CadastrarDetalhesRestaurante.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './CadastrarDetalhesRestaurante.module.css'; // Use o seu CSS aqui
import CabecalhoRestaurante from '../../../components/CabecalhoRestaurante/CabecalhoRestaurante';

export default function CadastrarDetalhesRestaurante() {
    const navigate = useNavigate();
    const location = useLocation();

    const restauranteParaEditar = location.state?.restauranteParaEditar;
    const isEditMode = Boolean(restauranteParaEditar);

    const [nome, setNome] = useState(restauranteParaEditar?.nome || '');
    const [idCozinha, setIdCozinha] = useState(restauranteParaEditar?.id_cozinha?.toString() || '');
    const [taxaFrete, setTaxaFrete] = useState(restauranteParaEditar?.taxa_frete?.toString() || '0.00');
    const [urlImagemLogo, setUrlImagemLogo] = useState(restauranteParaEditar?.url_imagem_logo || '');
    const [enderecoCep, setEnderecoCep] = useState(restauranteParaEditar?.endereco_cep || '');
    const [enderecoLogradouro, setEnderecoLogradouro] = useState(restauranteParaEditar?.endereco_logradouro || '');
    const [enderecoNumero, setEnderecoNumero] = useState(restauranteParaEditar?.endereco_numero || '');
    const [enderecoComplemento, setEnderecoComplemento] = useState(restauranteParaEditar?.endereco_complemento || '');
    const [enderecoBairro, setEnderecoBairro] = useState(restauranteParaEditar?.endereco_bairro || '');
    const [enderecoCidade, setEnderecoCidade] = useState(restauranteParaEditar?.endereco_cidade || '');
    const [enderecoEstado, setEnderecoEstado] = useState(restauranteParaEditar?.endereco_estado || '');

    const [cozinhas, setCozinhas] = useState([]);
    const [loading, setLoading] = useState(false);
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
                console.error("Erro ao buscar cozinhas:", error);
                setErro(error.message || "Não foi possível carregar a lista de cozinhas.");
            } finally {
                setLoading(false);
            }
        };
        fetchCozinhas();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setErro(''); setSuccessMessage('');

        if (!nome || !idCozinha || !enderecoLogradouro || !enderecoNumero || !enderecoBairro || !enderecoCidade || !enderecoEstado || !enderecoCep) {
            setErro("Por favor, preencha todos os campos obrigatórios (Nome, Cozinha, Endereço completo).");
            setLoading(false); return;
        }
        if (taxaFrete !== '' && isNaN(parseFloat(taxaFrete))) {
             setErro("Taxa de frete deve ser um número válido ou vazia.");
             setLoading(false); return;
        }

        const dadosRestaurante = {
            nome, id_cozinha: parseInt(idCozinha, 10),
            taxa_frete: taxaFrete ? parseFloat(taxaFrete) : 0.0,
            url_imagem_logo: urlImagemLogo || null, endereco_cep: enderecoCep,
            endereco_logradouro: enderecoLogradouro, endereco_numero: enderecoNumero,
            endereco_complemento: enderecoComplemento || null, endereco_bairro: enderecoBairro,
            endereco_cidade: enderecoCidade, endereco_estado: enderecoEstado,
        };

        const token = localStorage.getItem('authToken');
        if (!token) {
            setErro("Usuário não autenticado. Faça login novamente."); setLoading(false);
            setTimeout(() => navigate('/restaurante/login'), 2500); return;
        }

        const method = isEditMode ? 'PUT' : 'POST';
        const apiUrl = isEditMode
            ? `http://localhost:3001/api/restaurantes/meu-restaurante` // Para PUT
            : 'http://localhost:3001/api/restaurantes';             // Para POST

        // Logs para depuração da requisição
        console.log("--- Preparando para enviar para API ---");
        console.log("Modo de Edição:", isEditMode);
        console.log("Método HTTP:", method);
        console.log("URL da API:", apiUrl);
        console.log("Dados Enviados:", JSON.stringify(dadosRestaurante, null, 2));
        console.log("Token:", token ? "Presente" : "Ausente");
        console.log("------------------------------------");


        try {
            const response = await fetch(apiUrl, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dadosRestaurante)
            });

            const data = await response.json(); // Tenta ler o corpo da resposta, mesmo se não for 'ok'

            if (!response.ok) {
                console.error(`Erro ${response.status} ao ${isEditMode ? 'atualizar' : 'cadastrar'} restaurante:`, data);
                setErro(data.message || `Erro ${response.status} - Não foi possível completar a operação.`);
            } else {
                setSuccessMessage(`Restaurante ${isEditMode ? 'atualizado' : 'cadastrado'} com sucesso! Redirecionando...`);
                setTimeout(() => {
                    navigate('/restaurante/inicio');
                }, 2000);
            }
        } catch (error) {
            console.error(`Falha na requisição de ${isEditMode ? 'atualização' : 'cadastro'}:`, error);
            setErro("Falha grave ao conectar com o servidor. Verifique o console e o backend.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <CabecalhoRestaurante />
            <div className={styles.paginaContainer}> {/* Use sua classe CSS aqui */}
                <h1 className={styles.tituloPrincipal}> {/* Use sua classe CSS aqui */}
                    {isEditMode ? "Editar Detalhes do Restaurante" : "Cadastrar Detalhes do Restaurante"}
                </h1>
                <p className={styles.instrucao}> {/* Use sua classe CSS aqui */}
                    {isEditMode ? "Altere os dados abaixo do seu estabelecimento." : "Preencha os dados abaixo para cadastrar seu estabelecimento."}
                </p>

                {erro && <p className={styles.mensagemErro}>{erro}</p>} {/* Use sua classe CSS aqui */}
                {successMessage && <p className={styles.mensagemSucesso}>{successMessage}</p>} {/* Use sua classe CSS aqui */}

                <form onSubmit={handleSubmit} className={styles.formEstiloProjeto}> {/* Use sua classe CSS aqui */}
                    <div className={styles.inputs}> {/* Use sua classe CSS aqui */}
                        <input className={styles.texto} type="text" placeholder="Nome do Restaurante*" value={nome} onChange={(e) => setNome(e.target.value)} required disabled={loading} />
                        <select className={styles.texto} value={idCozinha} onChange={(e) => setIdCozinha(e.target.value)} required disabled={loading || (cozinhas.length === 0 && !isEditMode) }>
                            <option value="">{loading && cozinhas.length === 0 && !idCozinha ? "Carregando..." : "Tipo de Cozinha*"}</option>
                            {cozinhas.map(cozinha => (
                                <option key={cozinha.id_cozinha} value={cozinha.id_cozinha}>
                                    {cozinha.nome}
                                </option>
                            ))}
                        </select>
                        {cozinhas.length === 0 && !loading && !erro.includes("cozinhas") && <p className={styles.aviso}>Nenhuma cozinha encontrada.</p>}
                        
                        <input className={styles.texto} type="number" placeholder="Taxa de Frete (R$) (Ex: 5.00)" value={taxaFrete} onChange={(e) => setTaxaFrete(e.target.value)} step="0.01" min="0" disabled={loading} />
                        <input className={styles.texto} type="url" placeholder="URL da Imagem do Logo" value={urlImagemLogo} onChange={(e) => setUrlImagemLogo(e.target.value)} disabled={loading} />
                        
                        <h2 className={styles.instrucao} style={{marginTop: '1.5rem', fontSize: '1.2rem', fontWeight:'bold'}}>Endereço</h2>
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