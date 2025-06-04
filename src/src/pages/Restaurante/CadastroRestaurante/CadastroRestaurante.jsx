// src/pages/Restaurante/CadastroRestaurante/CadastroRestaurante.jsx
import styles from './CadastroRestaurante.module.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logo from '../../../assets/logo.png'; // Verifique o caminho do logo

function CadastroRestaurante() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false); 

  async function registrar(e) { 
    e.preventDefault(); 
    setErro('');
    console.log("1. Função registrar (restaurante) iniciada.");

    if (!email || !senha || !confirmaSenha) {
      setErro("Preencha todos os campos.");
      console.log("Erro: Campos não preenchidos.");
      return;
    }
    console.log("2. Validação de campos obrigatórios passou.");

    if (senha.length <= 6) {
      setErro("A senha deve ter mais de 6 caracteres.");
      console.log("Erro: Senha muito curta.");
      return;
    }
    console.log("3. Validação de tamanho da senha passou.");

    if (senha !== confirmaSenha) {
      setErro("As senhas não coincidem.");
      console.log("Erro: Senhas não coincidem.");
      return;
    }
    console.log("4. Validação de confirmação de senha passou.");

    setLoading(true);
    console.log("5. setLoading(true) chamado. Prestes a fazer o fetch para criar usuário do restaurante.");

    try {
     
      const response = await fetch('http://localhost:3001/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email, 
          senha: senha,
          // nome_completo pode ser opcional ou preenchido depois
          // cpf, telefone também opcionais para este usuário "restaurante"
        }),
      });
      console.log("6. Fetch realizado. Status da resposta:", response.status);

      const data = await response.json();
      console.log("7. Resposta convertida para JSON:", data);

      if (!response.ok) {
        setErro(data.message || `Erro ${response.status}: Não foi possível realizar o cadastro.`);
        console.log("Erro na resposta do backend:", data.message || `Status: ${response.status}`);
        return;
      }

      // Cadastro de usuário bem-sucedido
      console.log('Cadastro de usuário para restaurante realizado com sucesso:', data);
      alert('Conta de usuário para o restaurante criada com sucesso! Você será redirecionado para o login.');
      navigate("/restaurante/login"); // Navega para o login do restaurante

    } catch (error) {
      console.error("8. Erro no bloco try/catch:", error);
      setErro("Não foi possível conectar ao servidor ou ocorreu um erro na requisição. Verifique o console.");
    } finally {
      setLoading(false);
      console.log("9. Bloco finally executado, setLoading(false).");
    }
  }

  function irParaLogin() {
    navigate("/restaurante/login");
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.formulario}>
          <h2>Cadastro Usuário Restaurante</h2>

          <form onSubmit={registrar} className={styles.form}> 
            <input
              className={styles.input}
              type="email"
              placeholder="email@restaurante.com"
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
            <input
              className={styles.input}
              type="password"
              placeholder="confirmar senha"
              value={confirmaSenha}
              onChange={(e) => setConfirmaSenha(e.target.value)}
              disabled={loading}
            />
            {erro && <p className={styles.erro}>{erro}</p>}

           
            <button type="submit" className={styles.botao} disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar Usuário'}
            </button>
          </form>

          <hr className={styles.divisor} />

          <p className={styles.linkCadastro}>
            Já possui uma conta?{' '}
            <span className={styles.criar} onClick={irParaLogin}>
              Login
            </span>
          </p>
        </div>

        <div className={styles.logoContainer}>
          <img src={logo} alt="Logo Unifood" className={styles.logo} />
          <h1 className={styles.unifood}>UNIFOOD</h1>
          <p className={styles.subtitulo}>Para Restaurantes</p>
        </div>
      </div>
    </>
  );
}

export default CadastroRestaurante;