import styles from './CadastroRestaurante.module.css';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import logo from '../../../assets/logo.png'; // Verifique se o caminho do logo está correto

const API_URL = 'http://localhost:3001';

function CadastroRestaurante() {
    const navigate = useNavigate();
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
        
        // ✅ CORREÇÃO: Usando o nome correto da função, 'setErro'
        setErro('');
        setSuccess('');

        if (!formData.nome_completo || !formData.email || !formData.senha || !formData.confirmaSenha) {
            setErro("Preencha todos os campos.");
            return;
        }
        if (formData.senha !== formData.confirmaSenha) {
            setErro("As senhas não coincidem.");
            return;
        }
        if (formData.senha.length <= 6) {
            setErro("A senha deve ter mais de 6 caracteres.");
            return;
        }

        setLoading(true);
        try {
            const dadosParaEnviar = {
                nome_completo: formData.nome_completo,
                email: formData.email,
                senha: formData.senha,
                tipo_usuario: 'R' // Define o tipo como 'Restaurante'
            };

            const response = await fetch(`${API_URL}/api/usuarios/registrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosParaEnviar),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Não foi possível realizar o cadastro.');
            }

            setSuccess('Conta de usuário criada! Você será redirecionado para o login.');
            setTimeout(() => {
                navigate("/restaurante/login");
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
                <h2>Cadastro Usuário Restaurante</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {erro && <p className={styles.erro}>{erro}</p>}
                    {success && <p className={styles.sucesso}>{success}</p>}
                    
                    <input
                        className={styles.input}
                        type="text"
                        name="nome_completo"
                        placeholder="Nome do Responsável"
                        value={formData.nome_completo}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                    <input
                        className={styles.input}
                        type="email"
                        name="email"
                        placeholder="email@restaurante.com"
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
                        {loading ? 'Cadastrando...' : 'Cadastrar Usuário'}
                    </button>
                </form>
                <hr className={styles.divisor} />
                <p className={styles.linkCadastro}>
                    Já possui uma conta?{' '}
                    <Link to="/restaurante/login" className={styles.criar}>
                        Login
                    </Link>
                </p>
            </div>
            <div className={styles.logoContainer}>
                <img src={logo} alt="Logo Unifood" className={styles.logo} />
                <h1 className={styles.unifood}>UNIFOOD</h1>
                <p className={styles.subtitulo}>Para Restaurantes</p>
            </div>
        </div>
    );
}

export default CadastroRestaurante;
