import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "./InicioRestaurante.module.css"; 
import CabecalhoRestaurante from "../../../components/CabecalhoRestaurante/CabecalhoRestaurante.jsx";
import imagemRestaurantePadrao from "../../../assets/restaure.png"; 

export default function InicioRestaurante() {
    const [restaurante, setRestaurante] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const fetchMeuRestaurante = useCallback(async () => {
        setLoading(true);
        setErro('');
        setSuccessMessage(''); 
        
        const token = localStorage.getItem('token');

        if (!token) {
            setErro("Autenticação necessária. Redirecionando para login...");
            setLoading(false);
            setTimeout(() => navigate('/login'), 2500); 
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/restaurantes/meu-restaurante', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('token'); 
                    localStorage.removeItem('userData');
                    setErro(data.message || "Sessão inválida. Faça login novamente.");
                    setTimeout(() => navigate('/login'), 2500);
                } else if (response.status === 404) {
                    setErro("Você ainda não cadastrou os dados do seu restaurante.");
                } else { 
                    setErro(data.message || "Não foi possível carregar os dados."); 
                }
                setRestaurante(null);
            } else { 
                setRestaurante(data); 
            }
        } catch (fetchError) {
            setErro("Falha ao conectar com o servidor."); 
            setRestaurante(null);
        } finally { 
            setLoading(false); 
        }
    }, [navigate]);

    useEffect(() => {
        fetchMeuRestaurante();
    }, [fetchMeuRestaurante]);

    const handleEditarDetalhes = () => {
        if (restaurante) {
            navigate('/restaurante/cadastrar-detalhes');
        } else { 
            setErro("Dados do restaurante não disponíveis para edição."); 
        }
    };

    const handleApagarRestaurante = async () => {
        if (window.confirm('Tem certeza que deseja apagar seu restaurante? Esta ação não pode ser desfeita.')) {
            setLoading(true); setErro(''); setSuccessMessage('');
            
            const token = localStorage.getItem('token');

            if (!token || !restaurante) {
                setErro("Não é possível apagar. Tente recarregar a página."); 
                setLoading(false); 
                return;
            }

            try {
                const response = await fetch('http://localhost:3001/api/restaurantes/meu-restaurante', {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    setSuccessMessage("Restaurante apagado com sucesso! Atualizando...");
                    setTimeout(() => {
                        fetchMeuRestaurante();
                    }, 2000);
                } else {
                    let data = { message: `Erro ${response.status} ao apagar restaurante.` };
                    if (response.headers.get("content-type")?.includes("application/json")) {
                        data = await response.json();
                    }
                    setErro(data.message);
                }
            } catch (error) {
                setErro("Falha ao conectar com o servidor para apagar.");
            } finally {
                setLoading(false);
            }
        }
    };

 
    if (loading) {
        return (<> <CabecalhoRestaurante /> <h1 className={styles.titulo}>Meu Restaurante</h1> <div className={styles.containerMensagem}><p className={styles.mensagemCarregando}>Carregando...</p></div> </>);
    }
    if (successMessage) {
        return (<> <CabecalhoRestaurante /> <h1 className={styles.titulo}>Meu Restaurante</h1> <div className={styles.containerMensagem}><p className={styles.mensagemSucesso}>{successMessage}</p></div> </>);
    }
    if (erro && (erro.includes("Autenticação necessária") || erro.includes("Sessão inválida"))) {
        return (<> <CabecalhoRestaurante /> <h1 className={styles.titulo}>Acesso Negado</h1> <div className={styles.containerMensagem}><p className={styles.mensagemErroGeral}>{erro}</p></div> </>);
    }
    if (!restaurante && erro) {
        return (<> <CabecalhoRestaurante /> <div className={styles.restaurante}><h1 className={styles.titulo}>Meu Restaurante</h1> <div style={{padding: '2rem', textAlign: 'center'}}> <p className={styles.avisoRestauranteNaoCadastrado}>{erro}</p> <button className={styles.botaoAcaoPrincipal} onClick={() => navigate('/restaurante/cadastrar-detalhes')}>Cadastrar Detalhes do Restaurante</button> </div></div> </> );
    }
    if (!restaurante) {
        return (<> <CabecalhoRestaurante /> <h1 className={styles.titulo}>Meu Restaurante</h1> <div className={styles.containerMensagem}><p className={styles.mensagemErroGeral}>Nenhum restaurante encontrado.</p></div> </>);
    }

    return (
        <>
            <CabecalhoRestaurante />
            <h1 className={styles.titulo}>Meu Restaurante</h1>
            <div className={styles.restaurante}>
                <section className={styles.secao}>
                    <h3 className={styles.nome}>Nome do restaurante:</h3>
                    <h3 className={styles.texto}>{restaurante.nome}</h3>
                </section>
                <section className={styles.secao2}>
                    <h3 className={styles.nome}>Imagem:</h3>
                    <img 
                        src={restaurante.url_imagem_logo ? `http://localhost:3001${restaurante.url_imagem_logo}` : imagemRestaurantePadrao} 
                        alt={`Logo de ${restaurante.nome}`} 
                        className={styles.logo}
                    />
                </section>
                {restaurante.nome_cozinha && (
                    <section className={styles.secao}>
                        <h3 className={styles.nome}>Tipo de Cozinha:</h3>
                        <h3 className={styles.texto}>{restaurante.nome_cozinha}</h3>
                    </section>
                )}
                <section className={styles.opcoes}>
                    <button type="button" className={styles.botaoMudar} onClick={handleEditarDetalhes} disabled={loading}>Editar Detalhes</button>
                    <button type="button" className={styles.botaoExcluir} onClick={handleApagarRestaurante} disabled={loading}>Apagar Restaurante</button>
                </section>
            </div>
        </>
    );
}