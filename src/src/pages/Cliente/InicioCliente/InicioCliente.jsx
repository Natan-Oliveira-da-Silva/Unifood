// src/pages/Cliente/InicioCliente/InicioCliente.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './InicioCliente.module.css';
import CabecalhoCliente from '../../../components/CabecalhoCliente/CabecalhoCliente.jsx';
import RestauranteCard from '../../../components/RestauranteCard/RestauranteCard.jsx';

export default function InicioCliente() {
    const [usuario, setUsuario] = useState(null);
    const [restaurantes, setRestaurantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const navigate = useNavigate();

    // useEffect para buscar usuário e restaurantes
    useEffect(() => {
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
            setUsuario(JSON.parse(userDataString));
        }

        const fetchRestaurantes = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:3001/api/restaurantes');
                if (!response.ok) {
                    throw new Error("Não foi possível carregar os restaurantes.");
                }
                const data = await response.json();
                setRestaurantes(data);
            } catch (error) {
                console.error("Erro ao buscar restaurantes:", error);
                setErro(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurantes();
    }, []);

    return (
        <>
            <CabecalhoCliente nomeUsuario={usuario?.nome_completo || usuario?.email} />

            <main className={styles.container}>
                <div className={styles.buscaContainer}>
                    <input 
                        type="text" 
                        placeholder="Buscar restaurantes perto de você" 
                        className={styles.buscaInput}
                    />
                </div>

                <h2 className={styles.secaoTitulo}>Restaurantes recomendados para você</h2>

                {/* Área de exibição dos cards */}
                <div className={styles.conteudoPrincipal}>
                    {loading && <p className={styles.mensagemAviso}>Carregando restaurantes...</p>}
                    {erro && <p className={`${styles.mensagemAviso} ${styles.erro}`}>{erro}</p>}
                    
                    {!loading && !erro && (
                        <div className={styles.listaRestaurantes}>
                            {restaurantes.length > 0 ? (
                                restaurantes.map(restaurante => (
                                    <RestauranteCard key={restaurante.id_restaurante} restaurante={restaurante} />
                                ))
                            ) : (
                                <p className={styles.mensagemAviso}>Nenhum restaurante encontrado no momento.</p>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}