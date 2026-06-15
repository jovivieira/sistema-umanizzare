import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import logo from "../../assets/images/brand.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse, faCalendarCheck, faClipboardList,
  faUsers, faCalendar, faFileAlt, faShieldHalved,
  faGear, faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

export type Aba = "inicio" | "atendimentos" | "oficinas" | "tarefas" | "calendario" | "documentos" | "avaliacao";

type Props = {
  aba: Aba;
  onAbaChange: (aba: Aba) => void;
};

export function PatientHeader({ aba, onAbaChange }: Props) {
  const navigate = useNavigate();
  const userName = localStorage.getItem("@Umanizzare:name") || "Paciente";

  const [picture, setPicture] = useState(
    localStorage.getItem("@Umanizzare:picture") || ""
  );

  useEffect(() => {
    function handleUpdate() {
      setPicture(localStorage.getItem("@Umanizzare:picture") || "");
    }
    window.addEventListener("profileUpdated", handleUpdate);
    return () => window.removeEventListener("profileUpdated", handleUpdate);
  }, []);

  function getInitials(name: string) {
    return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  }

  function handleLogout() {
    localStorage.removeItem("@Umanizzare:token");
    localStorage.removeItem("@Umanizzare:role");
    localStorage.removeItem("@Umanizzare:name");
    localStorage.removeItem("@Umanizzare:picture");
    navigate("/login");
    window.location.reload();
  }

  const navItems: { id: Aba; label: string; icon: any }[] = [
    { id: "inicio",        label: "Início",            icon: faHouse },
    { id: "atendimentos",  label: "Atendimentos",      icon: faCalendarCheck },
    { id: "tarefas",       label: "Tarefas",           icon: faClipboardList },
    { id: "oficinas",      label: "Oficinas",          icon: faUsers },
    { id: "calendario",    label: "Calendário",        icon: faCalendar },
    { id: "documentos",    label: "Documentos",        icon: faFileAlt },
    { id: "avaliacao",     label: "Avaliação de Risco",icon: faShieldHalved },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoArea}>
        <img src={logo} alt="Umanizzare" className={styles.logoImage} />
        <h1 className={styles.brandName}>Umanizzare</h1>
      </div>

      <nav className={styles.nav}>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`${styles.navLink} ${aba === item.id ? styles.active : ""}`}
            onClick={() => onAbaChange(item.id)}
          >
            <FontAwesomeIcon icon={item.icon} className={styles.navIcon} />
            {item.label}
          </button>
        ))}

        <div className={`${styles.navLink} ${styles.navUser}`}>
          {picture ? (
            <img src={picture} alt={userName} className={styles.navAvatar} />
          ) : (
            <div className={styles.navAvatarPlaceholder}>{getInitials(userName)}</div>
          )}
          <span>Olá, {userName.split(" ")[0]}</span>
        </div>

        <button className={styles.navLink} onClick={() => navigate("/settings")}>
          <FontAwesomeIcon icon={faGear} className={styles.navIcon} />
          Configurações
        </button>

        <button onClick={handleLogout} className={`${styles.navLink} ${styles.navLogout}`}>
          <FontAwesomeIcon icon={faRightFromBracket} className={styles.navIcon} />
          Sair
        </button>
      </nav>
    </aside>
  );
}