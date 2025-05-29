import styles from "./TelaInicial.module.css";
import { useNavigate } from "react-router-dom";

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
      <div className={styles.logoContainer}>
        <img
          src="src/assets/unifood1.png"
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