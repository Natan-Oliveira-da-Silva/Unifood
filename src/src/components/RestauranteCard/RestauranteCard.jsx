import React from 'react';
import styles from './RestauranteCard.module.css';
import imagemPadrao from '../../assets/restaure.png';

export default function RestauranteCard({ restaurante, onClick }) {
    if (!restaurante) return null;

    const notaFormatada = restaurante.nota_avaliacao != null ? restaurante.nota_avaliacao.toFixed(1).replace('.', ',') : 'N/A';

    return (
        <div className={styles.card} onClick={() => onClick(restaurante)}>
            <img 
                src={restaurante.url_imagem_logo || imagemPadrao} 
                alt={`Logo de ${restaurante.nome}`} 
                className={styles.cardImagem}
                onError={(e) => { e.target.onerror = null; e.target.src = imagemPadrao; }} 
            />
            <div className={styles.cardInfo}>
                <h3 className={styles.cardTitulo}>{restaurante.nome}</h3>
                <div className={styles.cardDetalhes}>
                    <span className={styles.cardCozinha}>{restaurante.nome_cozinha || 'Cozinha não informada'}</span>
                    <span className={styles.cardNota}>⭐ {notaFormatada}</span>
                </div>
            </div>
        </div>
    );
}