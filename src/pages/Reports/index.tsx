import styles from "./styles.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers, faCalendarCheck, faChartBar,
  faArrowUp, faArrowDown, faDownload,
} from "@fortawesome/free-solid-svg-icons";

const atendimentosMes = [
  { mes: "Jan", total: 18 }, { mes: "Fev", total: 22 }, { mes: "Mar", total: 25 },
  { mes: "Abr", total: 20 }, { mes: "Mai", total: 28 }, { mes: "Jun", total: 15 },
];

const maxVal = Math.max(...atendimentosMes.map(m => m.total));

export function Reports() {
  const role = localStorage.getItem("@Umanizzare:role") || "USER";

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Relatórios</h1>
          <p className={styles.subtitle}>Indicadores e dados da operação do instituto.</p>
        </div>
        <button className={styles.btnExport}>
          <FontAwesomeIcon icon={faDownload} style={{ marginRight: 8 }} />
          Exportar relatório
        </button>
      </div>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        {[
          { icon: faUsers, label: "Total de assistidas", value: "48", change: "+12%", up: true, desc: "vs. mês anterior" },
          { icon: faCalendarCheck, label: "Atendimentos no mês", value: "15", change: "+8%", up: true, desc: "vs. mês anterior" },
          { icon: faUsers, label: "Novas assistidas", value: "6", change: "-2%", up: false, desc: "vs. mês anterior" },
          { icon: faChartBar, label: "Taxa de retorno", value: "78%", change: "+5%", up: true, desc: "vs. mês anterior" },
        ].map(k => (
          <div key={k.label} className={styles.kpiCard}>
            <div className={styles.kpiTop}>
              <div className={styles.kpiIconWrap}>
                <FontAwesomeIcon icon={k.icon} style={{ color: "#800020" }} />
              </div>
              <span className={`${styles.kpiChange} ${k.up ? styles.kpiUp : styles.kpiDown}`}>
                <FontAwesomeIcon icon={k.up ? faArrowUp : faArrowDown} style={{ marginRight: 3 }} />
                {k.change}
              </span>
            </div>
            <h3 className={styles.kpiValue}>{k.value}</h3>
            <p className={styles.kpiLabel}>{k.label}</p>
            <p className={styles.kpiDesc}>{k.desc}</p>
          </div>
        ))}
      </div>

      <div className={styles.grid}>

        {/* GRÁFICO DE ATENDIMENTOS */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <FontAwesomeIcon icon={faChartBar} style={{ marginRight: 8, color: "#800020" }} />
            Atendimentos por Mês
          </h3>
          <div className={styles.barChart}>
            {atendimentosMes.map(m => (
              <div key={m.mes} className={styles.barItem}>
                <div className={styles.barWrap}>
                  <div
                    className={styles.bar}
                    style={{ height: `${(m.total / maxVal) * 100}%` }}
                  >
                    <span className={styles.barValue}>{m.total}</span>
                  </div>
                </div>
                <span className={styles.barLabel}>{m.mes}</span>
              </div>
            ))}
          </div>
        </div>

        {/* DISTRIBUIÇÃO POR PERFIL */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <FontAwesomeIcon icon={faUsers} style={{ marginRight: 8, color: "#800020" }} />
            Perfil das Assistidas
          </h3>
          <div className={styles.profileList}>
            {[
              { label: "Desempregadas", value: 35, pct: 73 },
              { label: "Empregadas", value: 8, pct: 17 },
              { label: "Autônomas", value: 5, pct: 10 },
            ].map(p => (
              <div key={p.label} className={styles.profileItem}>
                <div className={styles.profileItemTop}>
                  <span className={styles.profileLabel}>{p.label}</span>
                  <span className={styles.profileValue}>{p.value} ({p.pct}%)</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${p.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* TABELA RECENTE */}
      <div className={styles.card} style={{ marginTop: 20 }}>
        <h3 className={styles.cardTitle}>
          <FontAwesomeIcon icon={faCalendarCheck} style={{ marginRight: 8, color: "#800020" }} />
          Últimos Atendimentos
        </h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Assistida</th>
              <th>Data</th>
              <th>Profissional</th>
              <th>Tipo</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { nome: "Maria Silva", data: "08/06/2026", prof: "Dra. Ana Lima", tipo: "Psicologia", status: "Realizado" },
              { nome: "Ana Souza", data: "07/06/2026", prof: "Dra. Ana Lima", tipo: "Psicologia", status: "Realizado" },
              { nome: "Juliana Costa", data: "07/06/2026", prof: "Dr. Carlos Melo", tipo: "Jurídico", status: "Realizado" },
              { nome: "Carla Mendes", data: "06/06/2026", prof: "Dra. Ana Lima", tipo: "Psicologia", status: "Cancelado" },
            ].map((a, i) => (
              <tr key={i}>
                <td><strong>{a.nome}</strong></td>
                <td>{a.data}</td>
                <td>{a.prof}</td>
                <td>{a.tipo}</td>
                <td>
                  <span className={a.status === "Realizado" ? styles.badgeOk : styles.badgeCancel}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
