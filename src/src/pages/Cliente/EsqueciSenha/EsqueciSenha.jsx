import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EsqueciSenha.module.css';
import logo from '../../../assets/logo.png'; // Ajuste o caminho se necessário

export default function EsqueciSenha() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErro('');
        setSuccessMessage('');

        if (!email) {
            setErro("Por favor, digite seu endereço de e-mail.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/usuarios/esqueci-senha', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            

            setSuccessMessage(data.message || "Se uma conta com este e-mail existir, um link de recuperação foi enviado.");

        } catch (error) {
            console.error("Erro ao solicitar recuperação de senha:", error);
            setErro("Falha ao comunicar com o servidor. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formulario}>
                <h2>Recuperar Senha</h2>
                <p className={styles.instrucao}>
                    Digite seu e-mail abaixo e enviaremos um link para você resetar sua senha.
                </p>

                {erro && <p className={styles.mensagemErro}>{erro}</p>}
                {successMessage && <p className={styles.mensagemSucesso}>{successMessage}</p>}

                {/* O formulário desaparece após a submissão bem-sucedida */}
                {!successMessage && (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <input
                            className={styles.input}
                            type="email"
                            placeholder="Seu e-mail de cadastro"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                        <button type="submit" className={styles.botao} disabled={loading}>
                            {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                        </button>
                    </form>
                )}

                <hr className={styles.divisor} />
                <span className={styles.linkVoltar} onClick={() => navigate('/cliente/login')}>
                    Voltar para o Login
                </span>
            </div>
            <div className={styles.logoContainer}>
                <img src={logo} alt="Logo Unifood" className={styles.logo} />
                <h1 className={styles.unifood}>UNIFOOD</h1>
            </div>
        </div>
    );
}