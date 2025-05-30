import CabecalhoCliente from "../../../components/CabecalhoCliente/CabecalhoCliente.jsx";
import styles from "./ConsultarPedidos.module.css";
function ConsultarPedidos() {
  return (
    <>
      <CabecalhoCliente/>

      <main className={styles.HistoricoPage}>

        <h1 className={styles.titulo}>Historico de Pedidos</h1>

        <div className={styles.pedidos}>

          <div className={styles.p1}>
            <h1 className={styles.tituloPedido}>X-Tudo</h1>

            <div className={styles.resto}>

              <section className={styles.dados}>
                <p>ID do pedido:</p>
                <p>Status:</p>
                <p>Restaurante:</p>
              </section>

              <section className={styles.links}>
                <a href="">Avaliar</a>
                <a href="">Pedir Novamente</a>
                <a href="">Ajuda</a>
              </section>

            </div>

            


          
           
          </div>

        </div>

      </main>
 
    </>
  );
}

export default ConsultarPedidos;
