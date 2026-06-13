import styles from "./styles.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck, faClipboardList, faUsers,
  faCheckCircle, faClock, faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";

const consultas = [
  { data: "10/06/2026", hora: "14:00", profissional: "Dra. Ana Lima", tipo: "Psicologia", status: "confirmada" },
  { data: "17/06/2026", hora: "10:00", profissional: "Dra. Ana Lima", tipo: "Psicologia", status: "pendente" },
  { data: "24/06/2026", hora: "14:00", profissional: "Dra. Ana Lima", tipo: "Psicologia", status: "pendente" },
];

const tarefas = [
  { titulo: "Diário de emoções", desc: "Anote 3 emoções que sentiu hoje e o que as causou.", prazo: "Hoje", feito: false },
  { titulo: "Exercício de respiração", desc: "Pratique 5 minutos de respiração diafragmática.", prazo: "Hoje", feito: true },
  { titulo: "Leitura indicada", desc: "Leia o capítulo 3 do livro 'Autocompaixão'.", prazo: "13/06", feito: false },
];

const oficinas = [
  { titulo: "Oficina de Artesanato", data: "12/06/2026", hora: "09:00", local: "Sala 2", vagas: 5 },
  { titulo: "Grupo de Apoio", data: "14/06/2026", hora: "15:00", local: "Auditório", vagas: 12 },
  { titulo: "Capacitação Profissional", data: "19/06/2026", hora: "08:00", local: "Sala 1", vagas: 8 },
];

export function PatientDashboard() {
  const userName = localStorage.getItem("@Umanizzare:name") || "Usuária";

  return (
    <div className={styles.page}>

      {/* HEADER */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Olá, {userName.split(" ")[0]}! 👋</h1>
          <p className={styles.subtitle}>Bem-vinda à sua área pessoal no Instituto Umanizzare.</p>
        </div>
      </div>

      {/* STATS */}
      <div className={styles.statsGrid}>
        {[
          { icon: faCalendarCheck, label: "Próxima consulta", value: "10/06", color: "#fdecea", iconColor: "#800020" },
          { icon: faClipboardList, label: "Tarefas pendentes", value: "2", color: "#fff3e0", iconColor: "#e65100" },
          { icon: faCheckCircle, label: "Tarefas concluídas", value: "1", color: "#e8f5e9", iconColor: "#2e7d32" },
          { icon: faUsers, label: "Oficinas disponíveis", value: "3", color: "#f3e5f5", iconColor: "#6a1b9a" },
        ].map(s => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: s.color }}>
              <FontAwesomeIcon icon={s.icon} style={{ color: s.iconColor, fontSize: "1.3rem" }} />
            </div>
            <div>
              <p className={styles.statLabel}>{s.label}</p>
              <h3 className={styles.statNumber}>{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.grid}>

        {/* CONSULTAS */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <h3><FontAwesomeIcon icon={faCalendarCheck} style={{ marginRight: 8, color: "#800020" }} />Minhas Consultas</h3>
          </div>
          <div className={styles.consultaList}>
            {consultas.map((c, i) => (
              <div key={i} className={styles.consultaItem}>
                <div className={styles.consultaData}>
                  <span className={styles.consultaDia}>{c.data.split("/")[0]}</span>
                  <span className={styles.consultaMes}>{["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][parseInt(c.data.split("/")[1])-1]}</span>
                </div>
                <div className={styles.consultaInfo}>
                  <p className={styles.consultaTipo}>{c.tipo}</p>
                  <p className={styles.consultaProf}>{c.profissional}</p>
                  <p className={styles.consultaHora}><FontAwesomeIcon icon={faClock} style={{ marginRight: 4 }} />{c.hora}</p>
                </div>
                <span className={`${styles.consultaStatus} ${c.status === "confirmada" ? styles.statusConfirmada : styles.statusPendente}`}>
                  {c.status === "confirmada" ? "Confirmada" : "Pendente"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* TAREFAS */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <h3><FontAwesomeIcon icon={faClipboardList} style={{ marginRight: 8, color: "#800020" }} />Minhas Tarefas</h3>
          </div>
          <div className={styles.tarefaList}>
            {tarefas.map((t, i) => (
              <div key={i} className={`${styles.tarefaItem} ${t.feito ? styles.tarefaFeita : ""}`}>
                <div className={styles.tarefaCheck}>
                  <FontAwesomeIcon icon={faCheckCircle} style={{ color: t.feito ? "#2e7d32" : "#ddd", fontSize: "1.2rem" }} />
                </div>
                <div className={styles.tarefaInfo}>
                  <p className={styles.tarefaTitulo}>{t.titulo}</p>
                  <p className={styles.tarefaDesc}>{t.desc}</p>
                  <span className={styles.tarefaPrazo}>
                    <FontAwesomeIcon icon={faClock} style={{ marginRight: 4 }} />Prazo: {t.prazo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* OFICINAS */}
      <div className={styles.card} style={{ marginTop: 20 }}>
        <div className={styles.cardHead}>
          <h3><FontAwesomeIcon icon={faUsers} style={{ marginRight: 8, color: "#800020" }} />Oficinas e Atividades</h3>
        </div>
        <div className={styles.oficinaGrid}>
          {oficinas.map((o, i) => (
            <div key={i} className={styles.oficinaCard}>
              <div className={styles.oficinaTopo}>
                <span className={styles.oficinaData}>{o.data}</span>
                <span className={styles.oficinaHora}>{o.hora}</span>
              </div>
              <h4 className={styles.oficinaTitulo}>{o.titulo}</h4>
              <p className={styles.oficinaLocal}>
                <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: 4, color: "#800020" }} />{o.local}
              </p>
              <p className={styles.oficinaVagas}>{o.vagas} vagas disponíveis</p>
              <button className={styles.btnInscrever}>Inscrever-se</button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}


