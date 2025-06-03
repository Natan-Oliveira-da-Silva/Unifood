import styles from './CabecalhoRestaurante.module.css';

function CabecalhoRestaurante () {
  return (
    <header className={styles.cabecalho}>
      <nav className={styles.nav}>
        <a href="/restaurante/inicio">Meu Restaurante</a>
        <a href="/restaurante/meusprodutos">Meus Produtos</a>
        <a href="/restaurante/criarproduto">Criar Produto</a>
        <a href="/TelaInicial/TelaInicial">Sair</a>
      </nav>
    </header>
  );
};

export default CabecalhoRestaurante;
