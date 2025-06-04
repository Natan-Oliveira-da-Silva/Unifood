// src/pages/Restaurante/InicioRestaurante/InicioRestaurante.jsx
import React, { useEffect, useState } from 'react'; // Adicionado useEffect e useState
import { useNavigate } from 'react-router-dom'; // Adicionado useNavigate
import styles from "./InicioRestaurante.module.css";
import CabecalhoRestaurante from "../../../components/CabecalhoRestaurante/CabecalhoRestaurante.jsx";
import imagemRestaurantePadrao from "../../../assets/restaure.png"; // Sua imagem padrão

export default function InicioRestaurante() {
  // Estados para armazenar os dados dinâmicos, erro e carregamento
  const [nomeRestaurante, setNomeRestaurante] = useState('Carregando nome...');
  const [urlImagemLogo, setUrlImagemLogo] = useState(imagemRestaurantePadrao); // Começa com a imagem padrão
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true); // Começa carregando
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeuRestaurante = async () => {
      setLoading(true);
      setErro(''); // Limpa erros anteriores
      const token = localStorage.getItem('authToken');

      if (!token) {
        setErro("Autenticação necessária. Redirecionando para login...");
        setLoading(false);
        setTimeout(() => navigate('/restaurante/login'), 2000);
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
            setErro(data.message || "Sessão inválida. Por favor, faça login novamente.");
            setTimeout(() => navigate('/restaurante/login'), 2500);
          } else if (response.status === 404) {
            setErro("Dados do restaurante ainda não cadastrados."); // Mensagem mais simples
            // Aqui você pode querer deixar o nome como "Não cadastrado" ou similar
            setNomeRestaurante('Restaurante não cadastrado');
            setUrlImagemLogo(imagemRestaurantePadrao); // Mantém a imagem padrão
          } else {
            setErro(data.message || "Não foi possível carregar os dados do restaurante.");
            setNomeRestaurante('Erro ao carregar');
          }
        } else {
          // Sucesso! Atualiza os estados com os dados do restaurante
          setNomeRestaurante(data.nome || 'Nome não fornecido');
          setUrlImagemLogo(data.url_imagem_logo || imagemRestaurantePadrao); // Usa a imagem do backend ou a padrão
          console.log("Dados do restaurante carregados:", data);
        }
      } catch (fetchError) {
        console.error("Falha na requisição para buscar restaurante:", fetchError);
        setErro("Falha ao conectar com o servidor.");
        setNomeRestaurante('Erro de conexão');
      } finally {
        setLoading(false);
      }
    };

    fetchMeuRestaurante();
  }, [navigate]);


  // Funções placeholder para os botões
  const handleMudarNome = () => alert('Funcionalidade "Mudar Nome" a ser implementada.');
  const handleMudarImagem = () => alert('Funcionalidade "Mudar Imagem" a ser implementada.');
  const handleApagarRestaurante = () => {
    if (window.confirm('Tem certeza que deseja apagar este restaurante?')) {
      alert('Funcionalidade "Apagar Restaurante" a ser implementada.');
    }
  };

  return (
    <>
      <CabecalhoRestaurante />
      <h1 className={styles.titulo}>Meu Restaurante</h1>

      
      {!loading && erro && erro !== "Dados do restaurante ainda não cadastrados." && (
        <p className={styles.mensagemErroGeral || styles.texto}>{erro}</p> 
      )}

      <div className={styles.restaurante}>
        <section className={styles.secao}>
          <h3 className={styles.nome}>Nome do restaurante:</h3>
          
          <h3 className={styles.texto}>
            {loading ? 'Carregando...' : nomeRestaurante}
          </h3>
        </section>

        <section className={styles.secao2}>
          <h3 className={styles.nome}>Imagem:</h3>
          
          <img 
            src={loading ? imagemRestaurantePadrao : urlImagemLogo} 
            alt="Imagem do restaurante" 
            className={loading ? styles.imagemCarregando : ''} 
          />
        </section>
        
        
        {!loading && erro === "Dados do restaurante ainda não cadastrados." && (
            <p className={styles.avisoRestauranteNaoCadastrado || styles.texto}>
                {erro} 
                <button onClick={() => navigate('/restaurante/cadastrar-detalhes')} style={{marginLeft: '10px'}}>
                    Cadastrar Agora
                </button>
            </p> 
        )}

        <section className={styles.opcoes}>
          <button type="button" className={styles.botaoMudar} onClick={handleMudarNome} disabled={loading || !!erro}>Mudar Nome</button>
          <button type="button" className={styles.botaoMudar} onClick={handleMudarImagem} disabled={loading || !!erro}>Mudar Imagem</button>
          <button type="button" className={styles.botaoExcluir} onClick={handleApagarRestaurante} disabled={loading || !!erro}>Apagar Restaurante</button>
        </section>
      </div>
    </>
  );
}