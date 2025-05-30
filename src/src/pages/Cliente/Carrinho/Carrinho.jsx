import CabecalhoCliente from "../../../components/CabecalhoCliente/CabecalhoCliente.jsx";
import FooterCliente from "../../../components/FooterCliente/FooterCliente.jsx";
import styles from "./Carrinho.module.css";
import a1 from "../../../assets/a1.png";


function Carrinho() {
  return (
    <>
      <div className={styles.CarrinhoPage}>
        <CabecalhoCliente/>
      
        <main className={styles.carrinhoMainContent}>

          <h1 className={styles.titulo}>Carrinho</h1>

          <div className={styles.Carrinho}>

            <section className={styles.Logo}>
              <img src={a1} alt="Logo do restaurante" className={styles.foto} />

            </section>

            <section className={styles.Logo}>
              <p>Item:</p>
              <p>Preço:</p>
              <p>Restaurante:</p>

            </section>

            <section className={styles.Logo}>
              <p>quantidade:</p>

            </section>

          </div>  

        </main>

        <FooterCliente/>

      </div>
    
    </>
  );
}

export default Carrinho;


