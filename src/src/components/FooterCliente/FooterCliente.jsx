import styles from "../FooterCliente/FooterCliente.module.css"

export default function FooterCliente(){
    return(
        <div className={styles.cabecalho}>
            <nav className={styles.nav}>
                <a href="/cliente/inicio">Adicionar ao carrinho</a>
                <a href="/cliente/consultarpedidos">Comprar Tudo</a>
            </nav>
        </div>

    );
}