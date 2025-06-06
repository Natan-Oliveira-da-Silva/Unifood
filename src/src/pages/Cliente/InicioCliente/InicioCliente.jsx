// src/pages/Cliente/InicioCliente/InicioCliente.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './InicioCliente.module.css';
import CabecalhoCliente from '../../../components/CabecalhoCliente/CabecalhoCliente.jsx';
import RestauranteCard from '../../../components/RestauranteCard/RestauranteCard.jsx';
import Modal from '../../../components/Modal/Modal.jsx';
import ProdutoItem from '../../../components/ProdutoItem/ProdutoItem.jsx'; // Importa o componente para cada item do cardápio

export default function InicioCliente() {
    // Estados da página principal
    const [usuario, setUsuario] = useState(null);
    const [restaurantes, setRestaurantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const navigate = useNavigate();

    // Estados para controlar o modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [produtosModal, setProdutosModal] = useState([]);
    const [loadingModal, setLoadingModal] = useState(false);

    useEffect(() => {
        // Pega os dados do usuário do localStorage para a saudação
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
            setUsuario(JSON.parse(userDataString));
        }

        // --- LÓGICA DE BUSCA DOS RESTAURANTES COMPLETA ---
        const fetchRestaurantes = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:3001/api/restaurantes');
                if (!response.ok) {
                    throw new Error("Não foi possível carregar os restaurantes. Tente novamente mais tarde.");
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
    }, []); // Roda apenas uma vez na montagem do componente

    // Função para abrir o modal e buscar os produtos
    const handleRestaurantClick = async (restaurante) => {
        setSelectedRestaurant(restaurante);
        setIsModalOpen(true);
        setLoadingModal(true);
        setProdutosModal([]);

        try {
            const response = await fetch(`http://localhost:3001/api/restaurantes/${restaurante.id_restaurante}/produtos`);
            if (!response.ok) throw new Error("Não foi possível carregar os produtos deste restaurante.");
            
            const data = await response.json();
            setProdutosModal(data);
        } catch (error) {
            console.error("Erro ao buscar produtos para o modal:", error);
        } finally {
            setLoadingModal(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRestaurant(null);
    };

    return (
        <>
            <CabecalhoCliente nomeUsuario={usuario?.nome_completo} />

            <main className={styles.container}>
                <div className={styles.buscaContainer}>
                    <input type="text" placeholder="Buscar restaurantes perto de você" className={styles.buscaInput} />
                </div>
                <h2 className={styles.secaoTitulo}>Restaurantes recomendados para você</h2>

                {loading && <p className={styles.mensagemAviso}>Carregando restaurantes...</p>}
                {erro && <p className={`${styles.mensagemAviso} ${styles.erro}`}>{erro}</p>}
                
                {!loading && !erro && (
                    <div className={styles.listaRestaurantes}>
                        {restaurantes.length > 0 ? (
                            restaurantes.map(restaurante => (
                                <RestauranteCard 
                                    key={restaurante.id_restaurante} 
                                    restaurante={restaurante} 
                                    onClick={handleRestaurantClick}
                                />
                            ))
                        ) : (
                            <p className={styles.mensagemAviso}>Nenhum restaurante encontrado no momento.</p>
                        )}
                    </div>
                )}
            </main>
            
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                {selectedRestaurant && (
                    <div className={styles.modalProdutoContainer}>
                        <h2 className={styles.modalTitulo}>{selectedRestaurant.nome}</h2>
                        <p className={styles.modalSubtitulo}>Cardápio</p>
                        <hr className={styles.modalDivisor} />
                        
                        {loadingModal ? (
                            <p>Carregando produtos...</p>
                        ) : (
                            <ul className={styles.listaProdutosModal}>
                                {produtosModal.length > 0 ? (
                                    produtosModal.map(produto => (
                                        <ProdutoItem key={produto.id_produto} produto={produto} />
                                    ))
                                ) : (
                                    <p>Este restaurante não possui produtos cadastrados no momento.</p>
                                )}
                            </ul>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
}