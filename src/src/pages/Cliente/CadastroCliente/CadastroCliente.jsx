import styles from './CadastroCliente.module.css';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import logo from '../../../assets/logo.png'; // Verifique se este caminho para o logo está correto

const API_URL = 'http://localhost:3001';

function CadastroCliente() {
    const navigate = useNavigate();
    // ✅ Usando um único estado para o formulário, que é mais organizado
    const [formData, setFormData] = useState({
        nome_completo: '',
        email: '',
        senha: '',
        confirmaSenha: ''
    });
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setErro('');
        setSuccess('');

        // Validações dos campos
        if (!formData.nome_completo || !formData.email || !formData.senha || !formData.confirmaSenha) {
            setErro("Preencha todos os campos.");
            return;
        }
        if (formData.senha.length <= 6) {
            setErro("A senha deve ter mais de 6 caracteres.");
            return;
        }
        if (formData.senha !== formData.confirmaSenha) {
            setErro("As senhas não coincidem.");
            return;
        }

        setLoading(true);
        try {
            // ✅ Prepara os dados para enviar, incluindo o nome_completo
            const dadosParaEnviar = {
                nome_completo: formData.nome_completo,
                email: formData.email,
                senha: formData.senha,
                tipo_usuario: 'C' // Define o tipo como 'Cliente'
            };

            // ✅ URL CORRIGIDA: Apontando para /api/usuarios/registrar
            const response = await fetch(`${API_URL}/api/usuarios/registrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosParaEnviar),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Não foi possível realizar o cadastro.');
            }

            setSuccess('Cadastro realizado com sucesso! Redirecionando para o login.');
            setTimeout(() => {
                navigate("/cliente/login");
            }, 2500);

        } catch (error) {
            setErro(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.formulario}>
                <h2>Cadastro Clientes</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {erro && <p className={styles.erro}>{erro}</p>}
                    {success && <p className={styles.sucesso}>{success}</p>}
                    
                    {/* ✅ CAMPO ADICIONADO: Nome Completo */}
                    <input
                        className={styles.input}
                        type="text"
                        name="nome_completo"
                        placeholder="Nome Completo"
                        value={formData.nome_completo}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                    <input
                        className={styles.input}
                        type="email"
                        name="email"
                        placeholder="email@cliente.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                    <input
                        className={styles.input}
                        type="password"
                        name="senha"
                        placeholder="Senha (mínimo 7 caracteres)"
                        value={formData.senha}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                    <input
                        className={styles.input}
                        type="password"
                        name="confirmaSenha"
                        placeholder="Confirmar Senha"
                        value={formData.confirmaSenha}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                    <button type="submit" className={styles.botao} disabled={loading || success}>
                        {loading ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                </form>
                <hr className={styles.divisor} />
                <p className={styles.linkCadastro}>
                    Já possui uma conta?{' '}
                    <Link to="/cliente/login" className={styles.criar}>
                        Login
                    </Link>
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
