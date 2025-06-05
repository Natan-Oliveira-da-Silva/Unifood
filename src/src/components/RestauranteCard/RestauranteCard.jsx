import React from 'react';
import styles from './RestauranteCard.module.css';
import imagemPadrao from '../../assets/restaure.png';

export default function RestauranteCard({ restaurante }) {
    if (!restaurante) return null;
    const notaFormatada = restaurante.nota_avaliacao != null ? restaurante.nota_avaliacao.toFixed(1).replace('.', ',') : 'N/A';
    return (
        <div className={styles.card} onClick={() => alert(`Navegar para o restaurante: ${restaurante.nome}`)}>
            <img 
                src={restaurante.url_imagem_logo || imagemPadrao} 
                alt={`Logo de ${restaurante.nome}`} 
                className={styles.cardImagem}
                onError={(e) => { e.target.onerror = null; e.target.src = imagemPadrao; }}
            />
            <div className={styles.cardInfo}>
                <h3 className={styles.cardTitulo}>{restaurante.nome}</h3>
                <p className={styles.cardNota}>Nota: {notaFormatada}</p>
            </div>
        </div>
    );
}