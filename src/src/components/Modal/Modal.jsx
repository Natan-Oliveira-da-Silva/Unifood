// src/components/Modal/Modal.jsx
import React from 'react';
import styles from './Modal.module.css';

// O Modal recebe 3 props:
// isOpen: um booleano que diz se o modal deve estar visível
// onClose: uma função para ser chamada quando o modal deve fechar
// children: o conteúdo que será exibido dentro do modal
export default function Modal({ isOpen, onClose, children }) {
    if (!isOpen) {
        return null; // Se não estiver aberto, não renderiza nada
    }

    return (
        // O fundo escurecido que cobre a tela
        <div className={styles.modalOverlay} onClick={onClose}>
            {/* O container do conteúdo do modal */}
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                {/* O botão 'X' para fechar */}
                <button className={styles.closeButton} onClick={onClose}>
                    &times; {/* Isso renderiza um "X" */}
                </button>
                {/* Renderiza o conteúdo que foi passado para o modal */}
                {children}
            </div>
        </div>
    );
}