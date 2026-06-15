import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers, faCalendarCheck, faChartBar,
  faDownload, faSpinner, faUserCheck,
  faHandshake,
} from "@fortawesome/free-solid-svg-icons";
import { apiService } from "../../services/api";

const BASE_URL = "http://147.93.9.44:8002";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("@Umanizzare:token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatarData(data: string) {
  if (!data) return "—";
  try { return new Date(data).toLocaleDateString("pt-BR"); } catch { return data; }
}

type Paciente = { id: string; name?: string; nome?: string; email: string; role?: string; createdAt?: string; };
type Consulta = { id: number; data: string; horario: string; status?: string; psicologo?: { name?: string; nome?: string }; pacientes?: { name?: string; nome?: string }[]; };
type Workshop = { id: number; titulo: string; data: string; horario: string; };

export function Reports() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);

  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [loadingConsultas, setLoadingConsultas] = useState(true);
  const [loadingWorkshops, setLoadingWorkshops] = useState(true);

  useEffect(() => {
    carregarPacientes();
    carregarConsultas();
    carregarWorkshops();
  }, []);

  async function carregarPacientes() {
    try {
      const data = await apiService.getUsers();
      const lista = Array.isArray(data) ? data : data.users || data.data || [];
      setPacientes(lista.filter((u: Paciente) => u.role !== "ADMIN"));
    } catch { } finally { setLoadingPacientes(false); }
  }

  async function carregarConsultas() {
    try {
      const resp = await fetch(`${BASE_URL}/consultas?limit=9999`, { headers: getAuthHeaders() });
      if (resp.ok) {
        const data = await resp.json();
        setConsultas(Array.isArray(data) ? data : data.consultas || data.data || []);
      }
    } catch { } finally { setLoadingConsultas(false); }
  }

  async function carregarWorkshops() {
    try {
      const data = await (apiService as any).getWorkshops();
      setWorkshops(Array.isArray(data) ? data : data.workshops || data.data || []);
    } catch { } finally { setLoadingWorkshops(false); }
  }

  const loading = loadingPacientes || loadingConsultas || loadingWorkshops;

  // Métricas calculadas
  const totalPacientes = pacientes.length;
  const totalConsultas = consultas.length;
  const totalWorkshops = workshops.length;

  const mesAtual = new Date().getMonth();
  const anoAtual = new Date().getFullYear();

  const consultasMes = consultas.filter(c => {
    const d = new Date(c.data);
    return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
  });

  const consultasRealizadas = consultas.filter(c => c.status === "realizada" || c.status === "confirmada");
  const consultasFuturas = consultas.filter(c => new Date(c.data) >= new Date());

  // Atendimentos por mês (últimos 6 meses)
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const ultimos6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return { mes: meses[d.getMonth()], month: d.getMonth(), year: d.getFullYear() };
  });

  const consPorMes = ultimos6.map(m => ({
    mes: m.mes,
    total: consultas.filter(c => {
      const d = new Date(c.data);
      return d.getMonth() === m.month && d.getFullYear() === m.year;
    }).length,
  }));

  const maxVal = Math.max(...consPorMes.map(m => m.total), 1);

  // Últimas consultas
  const ultimasConsultas = [...consultas]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5);

  // Próximas oficinas
  const proximasOficinas = [...workshops]
    .filter(w => new Date(w.data) >= new Date())
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 4);

  const kpis = [
    { icon: faUsers, label: "Total de assistidas", value: loadingPacientes ? "..." : totalPacientes, desc: "Pacientes cadastradas" },
    { icon: faCalendarCheck, label: "Consultas no mês", value: loadingConsultas ? "..." : consultasMes.length, desc: `De ${totalConsultas} no total` },
    { icon: faUserCheck, label: "Consultas realizadas", value: loadingConsultas ? "..." : consultasRealizadas.length, desc: "Confirmadas ou realizadas" },
    { icon: faHandshake, label: "Oficinas cadastradas", value: loadingWorkshops ? "..." : totalWorkshops, desc: `${proximasOficinas.length} próximas` },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Relatórios</h1>
          <p className={styles.subtitle}>Indicadores e dados da operação do instituto.</p>
        </div>
        <button className={styles.btnExport} onClick={() => window.print()}>
          <FontAwesomeIcon icon={faDownload} style={{ marginRight: 8 }} />
          Exportar relatório
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: 32, color: "#800020" }}>
          <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: "1.8rem" }} />
          <p style={{ marginTop: 10, color: "#888" }}>Carregando dados...</p>
        </div>
      )}

      {!loading && (<>

        {/* KPIs */}
        <div className={styles.kpiGrid}>
          {kpis.map(k => (
            <div key={k.label} className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <div className={styles.kpiIconWrap}>
                  <FontAwesomeIcon icon={k.icon} style={{ color: "#800020" }} />
                </div>
              </div>
              <h3 className={styles.kpiValue}>{k.value}</h3>
              <p className={styles.kpiLabel}>{k.label}</p>
              <p className={styles.kpiDesc}>{k.desc}</p>
            </div>
          ))}
        </div>

        <div className={styles.grid}>

          {/* GRÁFICO CONSULTAS POR MÊS */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FontAwesomeIcon icon={faChartBar} style={{ marginRight: 8, color: "#800020" }} />
              Consultas por Mês (últimos 6 meses)
            </h3>
            {consPorMes.every(m => m.total === 0) ? (
              <p style={{ color: "#aaa", textAlign: "center", padding: "32px 0" }}>Nenhuma consulta registrada.</p>
            ) : (
              <div className={styles.barChart}>
                {consPorMes.map(m => (
                  <div key={m.mes} className={styles.barItem}>
                    <div className={styles.barWrap}>
                      <div className={styles.bar} style={{ height: `${(m.total / maxVal) * 100}%` }}>
                        {m.total > 0 && <span className={styles.barValue}>{m.total}</span>}
                      </div>
                    </div>
                    <span className={styles.barLabel}>{m.mes}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PRÓXIMAS OFICINAS */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FontAwesomeIcon icon={faHandshake} style={{ marginRight: 8, color: "#800020" }} />
              Próximas Oficinas
            </h3>
            {proximasOficinas.length === 0 ? (
              <p style={{ color: "#aaa", textAlign: "center", padding: "32px 0" }}>Nenhuma oficina agendada.</p>
            ) : (
              <div className={styles.profileList}>
                {proximasOficinas.map(w => (
                  <div key={w.id} className={styles.oficinaItem}>
                    <div className={styles.oficinaDot} />
                    <div>
                      <p className={styles.oficinaTitulo}>{w.titulo}</p>
                      <p className={styles.oficinaMeta}>{formatarData(w.data)} · {w.horario}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* TABELA ÚLTIMAS CONSULTAS */}
        <div className={styles.card} style={{ marginTop: 20 }}>
          <h3 className={styles.cardTitle}>
            <FontAwesomeIcon icon={faCalendarCheck} style={{ marginRight: 8, color: "#800020" }} />
            Últimas Consultas
          </h3>
          {ultimasConsultas.length === 0 ? (
            <p style={{ color: "#aaa", textAlign: "center", padding: "32px 0" }}>Nenhuma consulta registrada.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Horário</th>
                  <th>Profissional</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ultimasConsultas.map(c => (
                  <tr key={c.id}>
                    <td>{formatarData(c.data)}</td>
                    <td>{c.horario}</td>
                    <td>{c.psicologo?.name || c.psicologo?.nome || "—"}</td>
                    <td>
                      <span className={
                        c.status === "realizada" || c.status === "confirmada"
                          ? styles.badgeOk
                          : c.status === "cancelada"
                          ? styles.badgeCancel
                          : styles.badgePendente
                      }>
                        {c.status || "Pendente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* TOTAL PACIENTES */}
        <div className={styles.card} style={{ marginTop: 20 }}>
          <h3 className={styles.cardTitle}>
            <FontAwesomeIcon icon={faUsers} style={{ marginRight: 8, color: "#800020" }} />
            Pacientes Cadastradas ({totalPacientes})
          </h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.slice(0, 8).map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name || p.nome || "—"}</strong></td>
                  <td>{p.email}</td>
                  <td>{p.createdAt ? formatarData(p.createdAt) : "—"}</td>
                </tr>
              ))}
              {pacientes.length > 8 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", color: "#888", fontStyle: "italic" }}>
                    +{pacientes.length - 8} pacientes não exibidas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </>)}
    </div>
  );
}