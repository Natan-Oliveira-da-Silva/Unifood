import CabecalhoCliente from "../../../components/CabecalhoCliente/CabecalhoCliente.jsx";
import styles from "./Perfil.module.css";
function Perfil() {
  return (
    <>
      <CabecalhoCliente/>
      <h1 className={styles.titulo}>Deseja Alterar os seus dados?</h1>

      <div className={styles.inputs}>
        <input type="text" placeholder="Nome" className={styles.texto}/>
        <input type="text" placeholder="Senha" className={styles.texto} />
        <input type="text" placeholder="E-mail" className={styles.texto}/>
        <input type="number" placeholder="CEP" className={styles.texto}/>
        <input type="text" placeholder="Rua" className={styles.texto}/>
        <input type="text" placeholder="Bairro" className={styles.texto} />
        <input type="number" placeholder="Numero" className={styles.texto}/>
        <input type="text" placeholder="Complemento" className={styles.texto}/>
        <button type="button" className={styles.criar}>Alterar Perfil</button>
      </div>
    </>
  );
}

export default Perfil;
