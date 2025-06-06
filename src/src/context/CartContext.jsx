import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem('unifood-cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) { return []; }
    });

    useEffect(() => {
        localStorage.setItem('unifood-cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity) => {
        if (quantity <= 0) return;
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id_produto === product.id_produto);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id_produto === product.id_produto
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
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

export function useCart() {
    return useContext(CartContext);
}