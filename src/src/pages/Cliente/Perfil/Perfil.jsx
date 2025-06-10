import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa o useNavigate
import CabecalhoCliente from '../../../components/CabecalhoCliente/CabecalhoCliente';
import styles from './Perfil.module.css';

const API_URL = 'http://localhost:3001';

export default function Perfil() {
    const navigate = useNavigate(); // Inicializa o hook de navegação
    const [formData, setFormData] = useState({
        nome_completo: '',
        email: '',
        senha: '',
        endereco_cep: '',
        endereco_logradouro: '',
        endereco_bairro: '',
        endereco_numero: '',
        endereco_complemento: '',
        endereco_cidade: '',
        endereco_estado: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Autenticação necessária.");
                setLoading(false);
                return;
            }
            try {
                const response = await fetch(`${API_URL}/api/usuarios/meu-perfil`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error("Não foi possível carregar seus dados.");
                
                const data = await response.json();
                const safeData = Object.keys(formData).reduce((acc, key) => {
                    acc[key] = data[key] || '';
                    return acc;
                }, {});
                setFormData(safeData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const token = localStorage.getItem('token');
        
        const dadosParaAtualizar = { ...formData };
        if (!dadosParaAtualizar.senha) {
            delete dadosParaAtualizar.senha;
        }

        try {
            const response = await fetch(`${API_URL}/api/usuarios/meu-perfil`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dadosParaAtualizar)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            // ✅ --- LÓGICA DE SUCESSO E REDIRECIONAMENTO ---
            // 1. Define uma mensagem de sucesso mais informativa
            setSuccess("Perfil atualizado com sucesso! Redirecionando para a página inicial...");
            
            // 2. Limpa o campo de senha da tela por segurança
            setFormData(prev => ({ ...prev, senha: '' }));
            
            // 3. Usa o setTimeout para esperar 2 segundos antes de redirecionar
            setTimeout(() => {
                navigate('/cliente/inicio');
            }, 2000); // 2000 milissegundos = 2 segundos

        } catch (err) {
            setError(err.message);
        } finally {
            // Garante que o botão só seja reativado após o redirecionamento
            // Não vamos mais parar o loading aqui em caso de sucesso
            if (error) {
                setLoading(false);
            }
        }
    };

    if (loading && !formData.email) return <div><CabecalhoCliente /><p>Carregando perfil...</p></div>;

    return (
        <>
            <CabecalhoCliente nomeUsuario={formData.nome_completo} />
            <main className={styles.container}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <h2>Deseja Alterar os seus dados?</h2>
                    
                    {error && <p className={styles.mensagemErro}>{error}</p>}
                    {success && <p className={styles.mensagemSucesso}>{success}</p>}
                    
                    <input name="nome_completo" value={formData.nome_completo} onChange={handleInputChange} placeholder="Nome Completo" />
                    <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="E-mail" />
                    <input name="senha" type="password" value={formData.senha} onChange={handleInputChange} placeholder="Nova Senha (deixe em branco para não alterar)" />
                    <input name="endereco_cep" value={formData.endereco_cep} onChange={handleInputChange} placeholder="CEP" />
                    <input name="endereco_logradouro" value={formData.endereco_logradouro} onChange={handleInputChange} placeholder="Rua" />
                    <input name="endereco_bairro" value={formData.endereco_bairro} onChange={handleInputChange} placeholder="Bairro" />
                    <input name="endereco_numero" value={formData.endereco_numero} onChange={handleInputChange} placeholder="Número" />
                    <input name="endereco_complemento" value={formData.endereco_complemento} onChange={handleInputChange} placeholder="Complemento" />
                    <input name="endereco_cidade" value={formData.endereco_cidade} onChange={handleInputChange} placeholder="Cidade" />
                    <input name="endereco_estado" value={formData.endereco_estado} onChange={handleInputChange} placeholder="Estado (UF)" />

                    {/* O botão fica desativado durante o loading ou após o sucesso para evitar cliques duplos */}
                    <button type="submit" disabled={loading || success}>
                        {loading ? 'Salvando...' : 'Alterar Perfil'}
                    </button>
                </form>
            </main>
        </>
    );
}