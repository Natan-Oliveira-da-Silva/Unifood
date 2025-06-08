// src/pages/Cliente/LoginCliente/LoginCliente.jsx
import styles from './LoginCliente.module.css';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import logo from '../../../assets/logo.png';

function LoginCliente() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  async function logar(e) {
    e.preventDefault();
    setErro('');

    if (email === '' || senha === '') {
      setErro("Preencha todos os campos");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/usuarios/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        setErro(data.message || `Erro ${response.status}: Não foi possível realizar o login.`);
        return;
      }
      
      if (data.usuario && data.usuario.tipo_usuario !== 'C') {
          setErro("Este login é para usuários de restaurante. Use a área correta.");
          return;
      }

      console.log('Login de cliente realizado com sucesso:', data);

      if (data.token) {
        localStorage.setItem('token', data.token);
        if(data.usuario) {
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
        }
      }
      navigate("/cliente/inicio");

    } catch (error) {
      setLoading(false);
      console.error("Erro ao conectar com o servidor:", error);
      setErro("Não foi possível conectar ao servidor ou ocorreu um erro na requisição.");
    }
  }

  function irParaCadastro() {
    navigate("/cliente/cadastro");
  }

  return (
    <>
      <div className={styles.container}>
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

            <p className={styles.linkRecuperarSenha}>
            Esqueceu a senha?{' '}
            <span className={styles.recuperarSenha} onClick={() => navigate('/cliente/esqueci-senha')}>
              Recuperar senha
            </span>
          </p>
          <p className={styles.linkLoginRestaurante}>
            
            <span className={styles.linkLoginRestaurante} onClick={() => navigate('/restaurante/login')}>
              Login Restaurante
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