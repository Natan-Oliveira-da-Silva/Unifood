
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CadastrarDetalhesRestaurante.module.css'; 
import CabecalhoRestaurante from '../../../components/CabecalhoRestaurante/CabecalhoRestaurante';

export default function CadastrarDetalhesRestaurante() {
    const navigate = useNavigate();

    // Estados para os campos do formulário (a lista de estados permanece a mesma)
    const [nome, setNome] = useState('');
    const [idCozinha, setIdCozinha] = useState('');
    const [taxaFrete, setTaxaFrete] = useState('');
    const [urlImagemLogo, setUrlImagemLogo] = useState('');
    const [enderecoCep, setEnderecoCep] = useState('');
    const [enderecoLogradouro, setEnderecoLogradouro] = useState('');
    const [enderecoNumero, setEnderecoNumero] = useState('');
    const [enderecoComplemento, setEnderecoComplemento] = useState('');
    const [enderecoBairro, setEnderecoBairro] = useState('');
    const [enderecoCidade, setEnderecoCidade] = useState('');
    const [enderecoEstado, setEnderecoEstado] = useState('');

    const [cozinhas, setCozinhas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // useEffect para buscar cozinhas (lógica permanece a mesma)
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

    // handleSubmit (lógica permanece a mesma)
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
        const dadosRestaurante = { /* ... (objeto com dados do restaurante como antes) ... */
            nome, id_cozinha: parseInt(idCozinha, 10),
            taxa_frete: taxaFrete ? parseFloat(taxaFrete) : 0.0,
            url_imagem_logo: urlImagemLogo || null, endereco_cep: enderecoCep,
            endereco_logradouro: enderecoLogradouro, endereco_numero: enderecoNumero,
            endereco_complemento: enderecoComplemento || null, endereco_bairro: enderecoBairro,
            endereco_cidade: enderecoCidade, endereco_estado: enderecoEstado,
        };
        const token = localStorage.getItem('authToken');
        if (!token) {
            setErro("Usuário não autenticado."); setLoading(false);
            setTimeout(() => navigate('/restaurante/login'), 2500); return;
        }
        try {
            const response = await fetch('http://localhost:3001/api/restaurantes', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                body: JSON.stringify(dadosRestaurante)
            });
            const data = await response.json();
            if (!response.ok) {
                setErro(data.message || `Erro ${response.status} ao cadastrar restaurante.`);
            } else {
                setSuccessMessage("Restaurante cadastrado com sucesso! Redirecionando...");
                setTimeout(() => { navigate('/restaurante/inicio'); }, 2500);
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
            <div className={styles.paginaContainer}> {/* Container para centralizar o .inputs */}
                <h1 className={styles.titulo}>Cadastrar Detalhes do Restaurante</h1>
                <p className={styles.instrucao}>Preencha os dados abaixo para cadastrar seu estabelecimento.</p>

                {erro && <p className={styles.mensagemErro}>{erro}</p>}
                {successMessage && <p className={styles.mensagemSucesso}>{successMessage}</p>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.inputs}> {/* Container para os campos, conforme seu CSS */}
                        <input className={styles.texto} type="text" placeholder="Nome do Restaurante*" value={nome} onChange={(e) => setNome(e.target.value)} required disabled={loading} />
                        
                        <select className={styles.texto} value={idCozinha} onChange={(e) => setIdCozinha(e.target.value)} required disabled={loading || cozinhas.length === 0}>
                            <option value="">{loading && cozinhas.length === 0 ? "Carregando..." : "Tipo de Cozinha*"}</option>
                            {cozinhas.map(cozinha => (
                                <option key={cozinha.id_cozinha} value={cozinha.id_cozinha}>
                                    {cozinha.nome}
                                </option>
                            ))}
                        </select>
                        {cozinhas.length === 0 && !loading && !erro.includes("cozinhas") && <p className={styles.aviso}>Nenhuma cozinha encontrada.</p>}
                        
                        <input className={styles.texto} type="number" placeholder="Taxa de Frete (R$) (Ex: 5.00)" value={taxaFrete} onChange={(e) => setTaxaFrete(e.target.value)} step="0.01" min="0" disabled={loading} />
                        <input className={styles.texto} type="url" placeholder="URL da Imagem do Logo" value={urlImagemLogo} onChange={(e) => setUrlImagemLogo(e.target.value)} disabled={loading} />
                        
                        {/* Poderia adicionar um subtítulo para endereço aqui se quisesse, usando .instrucao ou .titulo com outra margem */}
                        <h2 className={styles.instrucao} style={{marginTop: '1.5rem', fontSize: '1.2rem', fontWeight:'bold'}}>Endereço</h2>
                        <input className={styles.texto} type="text" placeholder="CEP*" value={enderecoCep} onChange={(e) => setEnderecoCep(e.target.value)} required disabled={loading} />
                        <input className={styles.texto} type="text" placeholder="Logradouro*" value={enderecoLogradouro} onChange={(e) => setEnderecoLogradouro(e.target.value)} required disabled={loading} />
                        <input className={styles.texto} type="text" placeholder="Número*" value={enderecoNumero} onChange={(e) => setEnderecoNumero(e.target.value)} required disabled={loading} />
                        <input className={styles.texto} type="text" placeholder="Complemento" value={enderecoComplemento} onChange={(e) => setEnderecoComplemento(e.target.value)} disabled={loading} />
                        <input className={styles.texto} type="text" placeholder="Bairro*" value={enderecoBairro} onChange={(e) => setEnderecoBairro(e.target.value)} required disabled={loading} />
                        <input className={styles.texto} type="text" placeholder="Cidade*" value={enderecoCidade} onChange={(e) => setEnderecoCidade(e.target.value)} required disabled={loading} />
                        <input className={styles.texto} type="text" placeholder="Estado (UF)* (Ex: BA)" value={enderecoEstado} onChange={(e) => setEnderecoEstado(e.target.value)} required maxLength="2" disabled={loading} />

                        <button type="submit" className={styles.criar} disabled={loading || successMessage !== ''}>
                            {loading ? 'Cadastrando...' : 'Cadastrar Restaurante'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}