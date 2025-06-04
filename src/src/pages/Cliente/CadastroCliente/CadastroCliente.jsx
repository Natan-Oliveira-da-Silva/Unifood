import styles from './CadastroCliente.module.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logo from '../../../assets/logo.png'; // Verifique se este caminho para o logo está correto
import Batata_Frita from "../../../assets/Batata_Frita.png"; 
import Burrito from "../../../assets/Burrito.png";
import Fatia_pizza from "../../../assets/Fatia_pizza.png"; 
import Nachos from "../../../assets/Nachos.png";

function CadastroCliente() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false); // Estado para feedback de carregamento

  // SUBSTITUA A SUA FUNÇÃO 'registrar' ANTIGA POR ESTA COMPLETA:
  async function registrar(e) {
    e.preventDefault();
    setErro('');
    console.log("1. Função registrar iniciada."); // Log 1

    if (!email || !senha || !confirmaSenha) {
      setErro("Preencha todos os campos.");
      console.log("Erro: Campos não preenchidos."); // Log erro de validação
      return;
    }
    console.log("2. Validação de campos obrigatórios passou."); // Log 2

    if (senha.length <= 6) {
      setErro("A senha deve ter mais de 6 caracteres.");
      console.log("Erro: Senha muito curta."); // Log erro de validação
      return;
    }
    console.log("3. Validação de tamanho da senha passou."); // Log 3

    if (senha !== confirmaSenha) {
      setErro("As senhas não coincidem.");
      console.log("Erro: Senhas não coincidem."); // Log erro de validação
      return;
    }
    console.log("4. Validação de confirmação de senha passou."); // Log 4

    setLoading(true);
    console.log("5. setLoading(true) chamado. Prestes a fazer o fetch."); // Log 5

    try {
      
      const response = await fetch('http://localhost:3001/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          senha: senha,
          tipo_usuario: 'C'
          
        }),
      });
      console.log("6. Fetch realizado. Status da resposta:", response.status); // Log 6

      const data = await response.json();
      console.log("7. Resposta convertida para JSON:", data); // Log 7

      if (!response.ok) {
        setErro(data.message || `Erro ${response.status}: Não foi possível realizar o cadastro.`);
        console.log("Erro na resposta do backend:", data.message || `Status: ${response.status}`); // Log erro do backend
        // setLoading(false); // O setLoading(false) já está no finally
        return; // Retorna aqui para não navegar em caso de erro
      }

      // Cadastro bem-sucedido
      console.log('Cadastro realizado com sucesso:', data);
      // Você pode querer mostrar uma mensagem de sucesso antes de navegar
      // alert('Cadastro realizado com sucesso! Você será redirecionado para o login.');
      navigate("/cliente/login");

    } catch (error) {
      console.error("8. Erro no bloco try/catch (ex: falha de rede, DNS, CORS não configurado no backend):", error); // Log 8
      setErro("Não foi possível conectar ao servidor ou ocorreu um erro na requisição. Verifique o console do backend e do navegador.");
    } finally {
      setLoading(false);
      console.log("9. Bloco finally executado, setLoading(false)."); // Log 9
    }
  }
  // FIM DA FUNÇÃO 'registrar' SUBSTITUÍDA

  function irParaLogin() {
    navigate("/cliente/login");
  }

  return (
    <div className={styles.container}>

      <img src={Batata_Frita} className={styles.Batata_Frita}/>
      <img src={Burrito} className={styles.burrito}/>
      <img src={Fatia_pizza} className={styles.Fatia_pizza}/>
      <img src={Nachos} className={styles.Nachos}/>
      
      <div className={styles.formulario}>
        <h2>Cadastro Clientes</h2>

        {/* Certifique-se de que o onSubmit aponta para a função registrar */}
        <form onSubmit={registrar} className={styles.form}>
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
            {loading ? 'Cadastrando...' : 'Cadastrar'}
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
        <p className={styles.subtitulo}>Para Clientes</p>
      </div>
    </div>
  );
}

export default CadastroCliente;