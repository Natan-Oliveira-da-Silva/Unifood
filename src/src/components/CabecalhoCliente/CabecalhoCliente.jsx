import styles from "./CabecalhoCliente.module.css";

function CabecalhoCliente() {
  return (
    <header className={styles.cabecalho}>
      <nav className={styles.nav}>
        <p>Olá, Fulano</p>
        <a href="/cliente/inicio">Home</a>
        <a href="/cliente/consultarpedidos">Consultar Pedidos</a>
        <a href="/cliente/perfil">Perfil</a>
        <a href="/cliente/carrinho">Carrinho</a>
        <a href="/TelaInicial/TelaInicial">Sair</a>
      </nav>
    </header>
  );
}

export default CabecalhoCliente;
