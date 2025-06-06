// src/context/CartContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Cria o Contexto
const CartContext = createContext();

// 2. Cria o Provedor (Provider) do Contexto
export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem('unifood-cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Erro ao carregar o carrinho do localStorage:", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('unifood-cart', JSON.stringify(cartItems));
        } catch (error) {
            console.error("Erro ao salvar o carrinho no localStorage:", error);
        }
    }, [cartItems]);

    const addToCart = (product, quantity) => {
        if (quantity <= 0) return;

        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id_produto === product.id_produto);

            if (existingItem) {
                // Se o item já existe, retorna uma nova lista com a quantidade do item atualizada
                return prevItems.map(item =>
                    item.id_produto === product.id_produto
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                // <<< AQUI ESTÁ A CORREÇÃO CRUCIAL >>>
                // Se é um novo item, retorna uma nova lista com os itens antigos MAIS o novo item
                return [...prevItems, { ...product, quantity }];
            }
        });
        alert(`${quantity}x "${product.nome}" foi adicionado ao carrinho!`);
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id_produto !== productId));
    };

    const updateItemQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.id_produto === productId
                        ? { ...item, quantity: newQuantity }
                        : item
                )
            );
        }
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateItemQuantity,
        clearCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// 3. Hook personalizado para facilitar o uso
export function useCart() {
    return useContext(CartContext);
}