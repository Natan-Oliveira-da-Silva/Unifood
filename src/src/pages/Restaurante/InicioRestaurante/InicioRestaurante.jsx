import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "./InicioRestaurante.module.css";
import CabecalhoRestaurante from "../../../components/CabecalhoRestaurante/CabecalhoRestaurante.jsx";
import imagemRestaurantePadrao from "../../../assets/restaure.png";

export default function InicioRestaurante() {
  const [restaurante, setRestaurante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeuRestaurante = async () => {
      setLoading(true);
      setErro('');
      const token = localStorage.getItem('authToken');

      if (!token) {
        setErro("Autenticação necessária. Redirecionando para login...");
        setLoading(false);
        setTimeout(() => navigate('/restaurante/login'), 2500);
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/api/restaurantes/meu-restaurante', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();

        if (!response.ok) {
          console.error("Erro ao buscar restaurante:", data.message || `Status: ${response.status}`);
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            setErro(data.message || "Sessão inválida ou expirada. Por favor, faça login novamente.");
            setTimeout(() => navigate('/restaurante/login'), 2500);
          } else if (response.status === 404) {
            setErro("Você ainda não cadastrou os dados do seu restaurante.");
          } else {
            setErro(data.message || "Não foi possível carregar os dados do restaurante.");
          }
          setRestaurante(null); 
        } else {
          setRestaurante(data);
        }
      } catch (fetchError) {
        console.error("Falha na requisição para buscar restaurante:", fetchError);
        setErro("Falha ao conectar com o servidor.");
        setRestaurante(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMeuRestaurante();
  }, [navigate]);

  const handleMudarNome = () => alert('Funcionalidade "Mudar Nome" a ser implementada.');
  const handleMudarImagem = () => alert('Funcionalidade "Mudar Imagem" a ser implementada.');
  const handleApagarRestaurante = () => {
    if (window.confirm('Tem certeza que deseja apagar este restaurante?')) {
      alert('Funcionalidade "Apagar Restaurante" a ser implementada.');
    }
  };

  if (loading) {
    return (
      <>
        <CabecalhoRestaurante />
        <h1 className={styles.titulo}>Meu Restaurante</h1>
        <div className={styles.containerMensagem}>
          <p className={styles.mensagemCarregando}>Carregando dados do restaurante...</p>
        </div>
      </>
    );
  }

  // Prioriza exibir erros de autenticação/sessão
  if (erro && (erro.includes("Autenticação necessária") || erro.includes("Sessão inválida"))) {
    return (
      <>
        <CabecalhoRestaurante />
        <h1 className={styles.titulo}>Acesso Negado</h1>
        <div className={styles.containerMensagem}>
          <p className={styles.mensagemErroGeral}>{erro}</p>
        </div>
      </>
    );
  }
  
  
  if (!restaurante && erro === "Você ainda não cadastrou os dados do seu restaurante.") {
    return (
      <>
        <CabecalhoRestaurante />
        <div className={styles.restaurante}>
          <h1 className={styles.titulo}>Meu Restaurante</h1>
          <div style={{padding: '2rem', textAlign: 'center'}}> 
            <p className={styles.avisoRestauranteNaoCadastrado}>{erro}</p>
            <button
              className={styles.botaoAcaoPrincipal}
              onClick={() => navigate('/restaurante/cadastrar-detalhes')} 
            >
              Cadastrar Restaurante
            </button>
          </div>
        </div>
      </>
    );
  }

    if (erro) {
     return (
      <>
        <CabecalhoRestaurante />
        <h1 className={styles.titulo}>Meu Restaurante</h1>
        <div className={styles.containerMensagem}>
            <p className={styles.mensagemErroGeral}>{erro}</p>
        </div>
      </>
    );
  }
  
   if (!restaurante) {
      
      return (
           <>
            <CabecalhoRestaurante />
            <h1 className={styles.titulo}>Meu Restaurante</h1>
            <div className={styles.containerMensagem}>
                <p className={styles.mensagemErroGeral}>Não foi possível carregar as informações do restaurante.</p>
            </div>
        </>
      );
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
            src={restaurante.url_imagem_logo || imagemRestaurantePadrao}
            alt={`Logo de ${restaurante.nome}`}
           />
        </section>
        
        {restaurante.nome_cozinha && (
            <section className={styles.secao}>
                <h3 className={styles.nome}>Tipo de Cozinha:</h3>
                <h3 className={styles.texto}>{restaurante.nome_cozinha}</h3>
            </section>
        )}
      

        <section className={styles.opcoes}>
          <button type="button" className={styles.botaoMudar} onClick={handleMudarNome}>Mudar Nome</button>
          <button type="button" className={styles.botaoMudar} onClick={handleMudarImagem}>Mudar Imagem</button>
          <button type="button" className={styles.botaoExcluir} onClick={handleApagarRestaurante}>Apagar Restaurante</button>
        </section>
      </div>
    </>
  );
}