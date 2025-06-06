// src/pages/Cliente/InicioCliente/InicioCliente.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './InicioCliente.module.css';
import CabecalhoCliente from '../../../components/CabecalhoCliente/CabecalhoCliente.jsx';
import RestauranteCard from '../../../components/RestauranteCard/RestauranteCard.jsx';
import Modal from '../../../components/Modal/Modal.jsx';
import imagemProdutoPadrao from '../../../assets/restaure.png'; // Fallback para imagem de produto no modal

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
        // Pega os dados do usuário do localStorage
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
            setUsuario(JSON.parse(userDataString));
        }

        // <<< LÓGICA DE BUSCA DOS RESTAURANTES CORRIGIDA >>>
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
    }, []); 
    // Função para abrir o modal e buscar os produtos do restaurante
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
            // Você pode setar um erro específico para o modal aqui se quiser
        } finally {
            setLoadingModal(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRestaurant(null);
    };

    const formatarPreco = (preco) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(preco);

    return (
        <>
            <CabecalhoCliente nomeUsuario={usuario?.nome_completo} />

            <main className={styles.container}>
                {/* ... Sua barra de busca e título da seção ... */}
                <div className={styles.buscaContainer}>
                    <input type="text" placeholder="Buscar restaurantes perto de você" className={styles.buscaInput} />
                </div>
                <h2 className={styles.secaoTitulo}>Restaurantes recomendados para você</h2>

                {/* Renderização principal */}
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
            
            {/* Renderização do Modal */}
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
                                        <li key={produto.id_produto} className={styles.itemProdutoModal}>
                                            <img src={produto.url_imagem_principal || imagemProdutoPadrao} alt={produto.nome} className={styles.imagemProdutoModal} />
                                            <div className={styles.infoProdutoModal}>
                                                <h3 className={styles.nomeProdutoModal}>{produto.nome}</h3>
                                                <p className={styles.descricaoProdutoModal}>{produto.descricao}</p>
                                            </div>
                                            <span className={styles.precoProdutoModal}>{formatarPreco(produto.preco)}</span>
                                        </li>
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