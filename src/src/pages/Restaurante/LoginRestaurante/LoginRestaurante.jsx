import styles from './LoginRestaurante.module.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/logo.png';

function LoginRestaurante() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        setErro(''); 

        if (email === '' || senha === '') {
            setErro("Preencha todos os campos");
            return;
        }

        setLoading(true);
        console.log("1. Função handleLogin (restaurante) iniciada.");

        try {
            const response = await fetch('http://localhost:3001/api/usuarios/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    senha: senha,
                    // ✅ CORREÇÃO: Enviando o tipo de usuário correto ('R')
                    tipo_usuario: 'R', 
                }),
            });
            console.log("2. Fetch para login realizado. Status da resposta:", response.status);

            const data = await response.json();
            console.log("3. Resposta convertida para JSON:", data);

            if (!response.ok) {
                // Se a resposta do backend não for bem-sucedida, lança um erro com a mensagem
                throw new Error(data.message || `Erro ${response.status}: Não foi possível realizar o login.`);
            }

            // --- LÓGICA DE SUCESSO CORRIGIDA ---
            console.log('Login de restaurante realizado com sucesso:', data);

            // ✅ CORREÇÃO 2: Salva o token com a chave correta 'token' para consistência
            localStorage.setItem('token', data.token);

            if (data.usuario) {
                // Opcional: Salvar dados do usuário para fácil acesso
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
            }
            
            // ✅ CORREÇÃO 3: Lógica de redirecionamento inteligente
            if (data.usuario && data.usuario.possuiRestaurante) {
                // Se JÁ TEM restaurante, vai para o dashboard/início
                console.log("Redirecionando para /restaurante/inicio");
                navigate("/restaurante/inicio");
            } else {
                // Se NÃO TEM restaurante, vai DIRETO para a página de cadastro
                console.log("Redirecionando para /restaurante/cadastrar-detalhes");
                navigate("/restaurante/cadastrar-detalhes");
            }

        } catch (error) {
            setLoading(false); // Garante que o loading para em caso de erro
            console.error("4. Erro capturado:", error);
            setErro(error.message); // Exibe a mensagem de erro vinda do backend ou do catch
        }
        // Removido o setLoading(false) daqui para o bloco finally
    }

    function irParaCadastro() {
        navigate("/restaurante/cadastro");
    }
    function irParaLogin() {
        navigate("/cliente/login");
    }

    return (
        <div className={styles.container}>
            <div className={styles.formulario}>
                <h2>Login Restaurante</h2>
                <form onSubmit={handleLogin} className={styles.form}>
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
                    {erro && <p className={styles.erro}>{erro}</p>}
                    <button type="submit" className={styles.botao} disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
                <hr className={styles.divisor} />
                <p className={styles.linkCadastro}>
                    Não possui uma conta?{' '}
                    <span className={styles.criar} onClick={irParaCadastro}>
                        Cadastrar
                    </span>
                </p>

                <p className={styles.linkLoginRestaurante}>
                    <span className={styles.linkLoginRestaurante} onClick={irParaLogin}>
                        Login Cliente
                    </span>
                </p>
            </div>
            
            <div className={styles.logoContainer}>
                <img src={logo} alt="Logo Unifood" className={styles.logo} />
                <h1 className={styles.unifood}>UNIFOOD</h1>
                <p className={styles.subtitulo}>Para restaurantes</p>
            </div>
        </div>
    );
}

export default LoginRestaurante;