// src/pages/Cliente/LoginCliente/LoginCliente.jsx
import styles from './LoginCliente.module.css';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react'; // React já estava importado
import logo from '../../../assets/logo.png';
import Batata_Frita from "../../../assets/Batata_Frita.png"; 
import Macarrao from "../../../assets/Macarrao.png";
import Rosquinha from "../../../assets/Rosquinha.png"; 
import Sushi from "../../../assets/Sushi.png";


function LoginCliente() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false); // Adicionado para feedback

  // SUBSTITUA A SUA FUNÇÃO 'logar' ANTIGA POR ESTA:
  async function logar(e) {
    e.preventDefault();
    setErro(''); // Limpa erros anteriores

    if (email === '' || senha === '') {
      setErro("Preencha todos os campos");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/usuarios/login', { // Ajuste a URL se necessário
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          senha: senha,
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        // Se o backend retornar um erro (400, 401, 403, 500), data.message deve conter a mensagem
        setErro(data.message || `Erro ${response.status}: Não foi possível realizar o login.`);
        return;
      }

      // Login bem-sucedido
      console.log('Login realizado com sucesso:', data);

      // ARMAZENAR O TOKEN (Exemplo: localStorage)
      // Em aplicações mais complexas, considere Context API + localStorage ou cookies HttpOnly
      if (data.token) {
        localStorage.setItem('authToken', data.token); // Armazena o token
        // Você pode querer armazenar dados do usuário também, se retornados e úteis
        if(data.usuario) {
            localStorage.setItem('userData', JSON.stringify(data.usuario));
        }
      }

      // Navegar para a página inicial do cliente
      navigate("/cliente/inicio");

    } catch (error) {
      setLoading(false);
      console.error("Erro ao conectar com o servidor:", error);
      setErro("Não foi possível conectar ao servidor ou ocorreu um erro na requisição. Tente novamente mais tarde.");
    }
  }
  // FIM DA FUNÇÃO 'logar' SUBSTITUÍDA


  function irParaCadastro() {
    navigate("/cliente/cadastro");
  }

  return (
    <>
      <div className={styles.container}>

        <img src={Batata_Frita} className={styles.Batata_Frita}/>
        <img src={Macarrao} className={styles.Macarrao}/>
        <img src={Rosquinha} className={styles.Rosquinha}/>
        <img src={Sushi} className={styles.Sushi}/>

        <div className={styles.formulario}>
          <h2>Login Clientes</h2>

          <form onSubmit={logar} className={styles.form}>
            <input
              className={styles.input}
              type="email"
              placeholder="email@cliente.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <input
              className={styles.input}
              type="password"
              placeholder="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={loading}
            />

            {erro && <p className={styles.erro}>{erro}</p>}

            <button type="submit" className={styles.botao} disabled={loading}>
              {loading ? 'Entrando...' : 'Login'}
            </button>
          </form>

          <hr className={styles.divisor} />

          <p className={styles.linkCadastro}>
            Não possui uma conta?{' '}
            <span className={styles.criar} onClick={irParaCadastro}>
              Cadastrar
            </span>
          </p>
        </div>

        <div className={styles.logoContainer}>
          <img src={logo} alt="Logo Unifood" className={styles.logo} />
          <h1 className={styles.unifood}>UNIFOOD</h1>
          <p className={styles.subtitulo}>Para Clientes</p>
        </div>
      </div>
    </>
  );
}

export default LoginCliente;