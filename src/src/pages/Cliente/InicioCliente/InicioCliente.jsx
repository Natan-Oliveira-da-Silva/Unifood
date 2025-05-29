import CabecalhoCliente from "../../../components/CabecalhoCliente/CabecalhoCliente.jsx";
import styles from "./InicioCliente.module.css";
import a1 from "../../../assets/a1.png"

function InicioCliente() {
  return (
    <>
      <CabecalhoCliente/>
      <input type="text" className={styles.pesquisa} placeholder="Buscar restaurantes perto de você" />
      <p className={styles.recomendacoes}>Restaurantes recomendados para você</p>

      <div className={styles.Restaurantes}>
        
        <section className={styles.Restaurante1}>
          <img src={a1} alt="Restaurante 1" />
          <h2>Resaturante 1</h2>
          <p>Nota: 3,6</p>
        </section>

         <section className={styles.Restaurante1}>
          <img src={a1} alt="Restaurante 1" />
          <h2>Resaturante 1</h2>
          <p>Nota: 3,6</p>
        </section>

        <section className={styles.Restaurante1}>
          <img src={a1} alt="Restaurante 1" />
          <h2>Resaturante 1</h2>
          <p>Nota: 3,6</p>
        </section>

         <section className={styles.Restaurante1}>
          <img src={a1} alt="Restaurante 1" />
          <h2>Resaturante 1</h2>
          <p>Nota: 3,6</p>
        </section>
        
      </div>
      
    </>
  );
}

export default InicioCliente;