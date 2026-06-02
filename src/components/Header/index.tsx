import { Link, useNavigate, useLocation } from "react-router-dom";
import styles from "./styles.module.css";
import logo from "../../assets/images/brand.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faUserShield,
  faUsers,
  faFileAlt,
  faChartBar,
  faRightFromBracket,
  faUser,
  faRightToBracket,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("@Umanizzare:token");
  const userName = localStorage.getItem("@Umanizzare:name") || "Usuário";
  const userLoggedRole = localStorage.getItem("@Umanizzare:role") || "USER";
  const isAdm = userLoggedRole === "ADMIN";
  const isAuthenticated = !!token;

  function handleLogout() {
    localStorage.removeItem("@Umanizzare:token");
    localStorage.removeItem("@Umanizzare:role");
    localStorage.removeItem("@Umanizzare:name");
    navigate("/login");
    window.location.reload();
  }

  const isActive = (path: string) => location.pathname === path ? styles.active : "";

  return (
    <aside className={styles.sidebar}>

      <div className={styles.logoArea}>
        <img src={logo} alt="Umanizzare" className={styles.logoImage} />
        <h1 className={styles.brandName}>Umanizzare</h1>
      </div>

      <nav className={styles.nav}>

        <Link to="/" className={`${styles.navLink} ${isActive("/")}`}>
          <FontAwesomeIcon icon={faHouse} className={styles.navIcon} />
          Início
        </Link>

        {isAdm && (
          <Link to="/admin/users" className={`${styles.navLink} ${isActive("/admin/users")}`}>
            <FontAwesomeIcon icon={faUserShield} className={styles.navIcon} />
            Painel Admin
          </Link>
        )}

        <a href="#pacientes" className={styles.navLink}>
          <FontAwesomeIcon icon={faUsers} className={styles.navIcon} />
          Pacientes
        </a>

        <a href="#documentos" className={styles.navLink}>
          <FontAwesomeIcon icon={faFileAlt} className={styles.navIcon} />
          Documentos
        </a>

        <a href="#consultas" className={styles.navLink}>
          <FontAwesomeIcon icon={faChartBar} className={styles.navIcon} />
          Relatórios
        </a>

        {isAuthenticated ? (
          <>
            <span className={`${styles.navLink} ${styles.navUser}`}>
              <FontAwesomeIcon icon={faUser} className={styles.navIcon} />
              Olá, {userName}
            </span>
            
            <button onClick={handleLogout} className={`${styles.navLink} ${styles.navLogout}`}>
              <FontAwesomeIcon icon={faRightFromBracket} className={styles.navIcon} />
              Sair
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={`${styles.navLink} ${isActive("/login")}`}>
              <FontAwesomeIcon icon={faRightToBracket} className={styles.navIcon} />
              Login
            </Link>
            <Link to="/register" className={`${styles.navLink} ${isActive("/register")}`}>
              <FontAwesomeIcon icon={faUserPlus} className={styles.navIcon} />
              Cadastro
            </Link>
          </>
        )}

      </nav>
    </aside>
  );
}