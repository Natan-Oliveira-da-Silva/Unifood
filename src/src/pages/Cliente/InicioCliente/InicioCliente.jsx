import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './InicioCliente.module.css';
import CabecalhoCliente from '../../../components/CabecalhoCliente/CabecalhoCliente.jsx';
import RestauranteCard from '../../../components/RestauranteCard/RestauranteCard.jsx';
import Modal from '../../../components/Modal/Modal.jsx';
import ProdutoItem from '../../../components/ProdutoItem/ProdutoItem.jsx';
import { useCart } from '../../../context/CartContext';

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}


export default function InicioCliente() {
    const [usuario, setUsuario] = useState(null);
    const [restaurantes, setRestaurantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const navigate = useNavigate();

    const [termoBusca, setTermoBusca] = useState('');
    const termoBuscaDebounced = useDebounce(termoBusca, 300);

    // Estados para controlar o modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [produtosModal, setProdutosModal] = useState([]);
    const [loadingModal, setLoadingModal] = useState(false);
    const { addToCart } = useCart();

    useEffect(() => {
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

    const restaurantesFiltrados = useMemo(() => {
        if (!termoBuscaDebounced) {
            return restaurantes; 
        }
        return restaurantes.filter(restaurante =>
            restaurante.nome.toLowerCase().includes(termoBuscaDebounced.toLowerCase())
        );
    }, [restaurantes, termoBuscaDebounced]);

    const handleRestaurantClick = async (restaurante) => {
        setSelectedRestaurant(restaurante);
        setIsModalOpen(true);
        setLoadingModal(true);
        setProdutosModal([]);
        try {
            const response = await fetch(`http://localhost:3001/api/produtos/por-restaurante/${restaurante.id_restaurante}`);
            if (!response.ok) throw new Error("Não foi possível carregar os produtos deste restaurante.");
            const data = await response.json();
            setProdutosModal(data);
        } catch (error) {
            console.error("Erro ao buscar produtos para o modal:", error);
        } finally {
            setLoadingModal(false);
        }
    };

    const handleAddToCart = (produto, restaurante) => {
        const itemParaAdicionar = {
            ...produto,
            quantity: 1,
            taxa_frete_restaurante: restaurante.taxa_frete,
            id_restaurante: restaurante.id_restaurante
        };
        addToCart(itemParaAdicionar);
        alert(`${produto.nome} foi adicionado ao carrinho!`);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRestaurant(null);
    };

    return (
        <>
            <CabecalhoCliente />

            <main className={styles.container}>
                <div className={styles.buscaContainer}>
                    <svg className={styles.lupaIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path></svg>
                    <input 
                        type="text" 
                        placeholder="Buscar pelo nome do restaurante..." 
                        className={styles.buscaInput}
                        value={termoBusca}
                        onChange={(e) => setTermoBusca(e.target.value)}
                    />
                </div>
                <h2 className={styles.secaoTitulo}>Restaurantes recomendados para você</h2>

                {loading && <p className={styles.mensagemAviso}>Carregando restaurantes...</p>}
                {erro && <p className={`${styles.mensagemAviso} ${styles.erro}`}>{erro}</p>}
                
                {!loading && !erro && (
                    <div className={styles.listaRestaurantes}>
                        {restaurantesFiltrados.length > 0 ? (
                            restaurantesFiltrados.map(restaurante => (
                                <RestauranteCard 
                                    key={restaurante.id_restaurante} 
                                    restaurante={restaurante} 
                                    onClick={() => handleRestaurantClick(restaurante)}
                                />
                            ))
                        ) : (
                            <p className={styles.mensagemAviso}>Nenhum restaurante encontrado com o nome "{termoBusca}".</p>
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
                                        <ProdutoItem 
                                            key={produto.id_produto} 
                                            produto={produto} 
                                            onAddToCart={() => handleAddToCart(produto, selectedRestaurant)}
                                        />
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
