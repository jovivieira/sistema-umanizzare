import { Link } from 'react-router-dom';
import styles from './styles.module.css';
import logo from '../../assets/images/brand.png';

export function HomeHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <img src={logo} alt="Umanizzare" className={styles.logo} />
        <span className={styles.brand}>manizzare</span>
      </div>
      <div className={styles.right}>
        <Link to="/login" className={styles.btnLogin}>Entrar</Link>
      </div>
    </header>
  );
}