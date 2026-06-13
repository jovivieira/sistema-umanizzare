import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import logo from "../../assets/images/brand.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faUserShield,
  faUsers,
  faFileAlt,
  faChartBar,
  faRightFromBracket,
  faRightToBracket,
  faUserPlus,
  faGear,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("@Umanizzare:token");
  const userName = localStorage.getItem("@Umanizzare:name") || "PACIENTE";
  const userLoggedRole = localStorage.getItem("@Umanizzare:role") || "PACIENTE";
  const isAdm = userLoggedRole === "ADMIN";
  // const isPaciente = userLoggedRole === "PACIENTE";
  const isPaciente = userLoggedRole === "ADMIN";
  const isAuthenticated = !!token;

  const [picture, setPicture] = useState(
    localStorage.getItem("@Umanizzare:picture") || "",
  );

  useEffect(() => {
    function handleUpdate() {
      setPicture(localStorage.getItem("@Umanizzare:picture") || "");
    }
    window.addEventListener("profileUpdated", handleUpdate);
    return () => window.removeEventListener("profileUpdated", handleUpdate);
  }, []);

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  function handleLogout() {
    localStorage.removeItem("@Umanizzare:token");
    localStorage.removeItem("@Umanizzare:role");
    localStorage.removeItem("@Umanizzare:name");
    localStorage.removeItem("@Umanizzare:picture");
    navigate("/login");
    window.location.reload();
  }

  const isActive = (path: string) =>
    location.pathname === path ? styles.active : "";

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

        {isAuthenticated && isPaciente && (
          <Link
            to="/questionnaire/1"
            className={`${styles.navLink} ${isActive("/questionnaire/1")}`}
          >
            <FontAwesomeIcon icon={faClipboardList} className={styles.navIcon} />
            Avaliação de Risco
          </Link>
        )}

        {isAdm && (
          <>
            <Link
              to="/admin/users"
              className={`${styles.navLink} ${isActive("/admin/users")}`}
            >
              <FontAwesomeIcon icon={faUserShield} className={styles.navIcon} />
              Painel Admin
            </Link>

            <Link
              to="/admin/questionnaires"
              className={`${styles.navLink} ${isActive("/admin/questionnaires")}`}
            >
              <FontAwesomeIcon icon={faClipboardList} className={styles.navIcon} />
              Gerenciar Questionários
            </Link>
          </>
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
            <div className={`${styles.navLink} ${styles.navUser}`}>
              {picture ? (
                <img
                  src={picture}
                  alt={userName}
                  className={styles.navAvatar}
                />
              ) : (
                <div className={styles.navAvatarPlaceholder}>
                  {getInitials(userName)}
                </div>
              )}
              <span>Olá, {userName}</span>
            </div>

            <Link
              to="/settings"
              className={`${styles.navLink} ${isActive("/settings")}`}
            >
              <FontAwesomeIcon icon={faGear} className={styles.navIcon} />
              Configurações
            </Link>

            <button
              onClick={handleLogout}
              className={`${styles.navLink} ${styles.navLogout}`}
            >
              <FontAwesomeIcon
                icon={faRightFromBracket}
                className={styles.navIcon}
              />
              Sair
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className={`${styles.navLink} ${isActive("/login")}`}
            >
              <FontAwesomeIcon
                icon={faRightToBracket}
                className={styles.navIcon}
              />
              Login
            </Link>
            <Link
              to="/register"
              className={`${styles.navLink} ${isActive("/register")}`}
            >
              <FontAwesomeIcon icon={faUserPlus} className={styles.navIcon} />
              Cadastro
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
