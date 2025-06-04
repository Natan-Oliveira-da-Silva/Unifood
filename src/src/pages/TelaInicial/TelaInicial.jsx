import styles from "./TelaInicial.module.css";
import { useNavigate } from "react-router-dom";
import logo from '../../assets/logo.png'
import Pizza from "../../assets/Mao_Pizza.png";
import Cachorro from "../../assets/Cachorro_quente.png";

function TelaInicial() {
  const navigate = useNavigate();

  function irParaLoginDeCliente() {
    navigate("/cliente/login");
  }

  function irParaLoginDeRestaurante() {
    navigate("/restaurante/login");
  }

  return (
    
    <div className={styles.container}>
      <img src={Pizza} className={styles.pizza}/>
      <img src={Cachorro} className={styles.Cachorro}/>
      <div className={styles.logoContainer}>
        <img
          src={logo}
          alt=""
          className={styles.logo}
        />
      </div>
      <h1 className={styles.titulo}>Bem-vindo ao UniFood!</h1>
      <button onClick={irParaLoginDeCliente} className={styles.botao}>
        Sou Cliente
      </button>
      <button onClick={irParaLoginDeRestaurante} className={styles.botao}>
        Sou Restaurante
      </button>
    </div>
  );
}

export default TelaInicial;