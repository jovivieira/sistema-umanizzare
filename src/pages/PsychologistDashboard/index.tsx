import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck, faUsers, faClipboardList, faGear,
  faRightFromBracket, faSpinner, faCalendarDay,
  faCheckCircle, faXmarkCircle, faClock,
  faClipboardQuestion, faCalendarPlus, faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { apiService } from "../../services/api";
import logo from "../../assets/images/brand.png";
import styles from "./styles.module.css";

const BASE_URL = "http://147.93.9.44:8002";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("@Umanizzare:token");
  return token ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` } : { "Content-Type": "application/json" };
}

type Aba = "hoje" | "usuarios" | "questionarios";

type Consulta = {
  id: number; data: string; horario: string; status?: string;
  pacientes?: { id: number; pacienteId?: number; paciente?: any; relatorioCaminho: string }[];
  psicologo?: { name?: string; nome?: string; };
};

type User = {
  id: string; name: string; email: string;
  role: "USER" | "ADMIN" | "PSICOLOGO" | "PACIENTE";
};

type Questionario = { id: number; title: string; };

function formatarData(data: string) {
  if (!data) return "—";
  try { return new Date(data).toLocaleDateString("pt-BR"); } catch { return data; }
}

function hoje() {
  return new Date().toISOString().split("T")[0];
}

export function PsychologistDashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("@Umanizzare:name") || "Psicólogo";
  const primeiroNome = userName.split(" ")[0];
  const iniciais = userName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

  const [aba, setAba] = useState<Aba>("hoje");

  // Consultas de hoje
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loadingConsultas, setLoadingConsultas] = useState(true);
  const [erroConsultas, setErroConsultas] = useState("");

  // Usuários
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [erroUsuarios, setErroUsuarios] = useState("");
  const [searchUser, setSearchUser] = useState("");

  // Questionários
  const [questionarios, setQuestionarios] = useState<Questionario[]>([]);
  const [loadingQ, setLoadingQ] = useState(false);
  const [erroQ, setErroQ] = useState("");

  // Modal agendar consulta
  const [modalConsulta, setModalConsulta] = useState<User | null>(null);
  const [consultaData, setConsultaData] = useState("");
  const [consultaHorario, setConsultaHorario] = useState("");
  const [salvandoConsulta, setSalvandoConsulta] = useState(false);
  const [erroConsultaModal, setErroConsultaModal] = useState("");

  useEffect(() => { carregarConsultasHoje(); }, []);

  useEffect(() => {
    if (aba === "usuarios" && usuarios.length === 0) carregarUsuarios();
    if (aba === "questionarios" && questionarios.length === 0) carregarQuestionarios();
  }, [aba]);

  async function carregarConsultasHoje() {
    try {
      setLoadingConsultas(true); setErroConsultas("");
      const resp = await fetch(`${BASE_URL}/consultas?limit=9999`, { headers: getAuthHeaders() });
      if (!resp.ok) throw new Error("Erro ao buscar consultas.");
      const data = await resp.json();
      const lista: Consulta[] = Array.isArray(data) ? data : data.consultas || data.data || [];
      const hojeStr = hoje();
      setConsultas(lista.filter(c => c.data?.startsWith(hojeStr)));
    } catch (err) {
      setErroConsultas(err instanceof Error ? err.message : "Erro ao carregar consultas.");
    } finally { setLoadingConsultas(false); }
  }

  async function carregarUsuarios() {
    try {
      setLoadingUsuarios(true); setErroUsuarios("");
      const data = await apiService.getPacientesPsicologos();
      const lista = Array.isArray(data) ? data : data.pacientes || [];
      setUsuarios(lista.filter((u: User) => u.role !== "ADMIN"));
    } catch (err) {
      setErroUsuarios(err instanceof Error ? err.message : "Erro ao carregar usuários.");
    } finally { setLoadingUsuarios(false); }
  }

  async function carregarQuestionarios() {
    try {
      setLoadingQ(true); setErroQ("");
      const data = await apiService.getQuestionnaires();
      setQuestionarios(Array.isArray(data) ? data : data.questionarios || []);
    } catch (err) {
      setErroQ(err instanceof Error ? err.message : "Erro ao carregar questionários.");
    } finally { setLoadingQ(false); }
  }

  async function handleAgendarConsulta() {
    if (!modalConsulta || !consultaData || !consultaHorario) {
      setErroConsultaModal("Preencha data e horário."); return;
    }
    try {
      setSalvandoConsulta(true); setErroConsultaModal("");
      const psicologoId = localStorage.getItem("@Umanizzare:id");
      const resp = await fetch(`${BASE_URL}/consultas`, {
        method: "POST", headers: getAuthHeaders(),
        body: JSON.stringify({
          data: consultaData, horario: consultaHorario,
          psicologoId: psicologoId ? Number(psicologoId) : undefined,
        }),
      });
      const consulta = await resp.json();
      if (!resp.ok) throw new Error(consulta.message || "Erro ao criar consulta.");

      const resp2 = await fetch(`${BASE_URL}/consultas/${consulta.id}/pacientes`, {
        method: "POST", headers: getAuthHeaders(),
        body: JSON.stringify({ pacienteId: Number(modalConsulta.id) }),
      });
      if (!resp2.ok) { const d = await resp2.json(); throw new Error(d.message || "Erro ao vincular paciente."); }

      alert(`Consulta agendada para ${modalConsulta.name} em ${consultaData} às ${consultaHorario}!`);
      setModalConsulta(null); setConsultaData(""); setConsultaHorario("");
      if (consultaData === hoje()) carregarConsultasHoje();
    } catch (err) {
      setErroConsultaModal(err instanceof Error ? err.message : "Erro ao agendar.");
    } finally { setSalvandoConsulta(false); }
  }

  function handleLogout() {
    localStorage.removeItem("@Umanizzare:token");
    localStorage.removeItem("@Umanizzare:role");
    localStorage.removeItem("@Umanizzare:name");
    localStorage.removeItem("@Umanizzare:picture");
    navigate("/login");
    window.location.reload();
  }

  const consultasRealizadas = consultas.filter(c => c.status === "realizada" || c.status === "confirmada");
  const consultasPendentes = consultas.filter(c => !c.status || c.status === "pendente");
  const consultasCanceladas = consultas.filter(c => c.status === "cancelada");

  const usuariosFiltrados = usuarios.filter(u =>
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const navItems = [
    { id: "hoje", label: "Consultas de Hoje", icon: faCalendarDay },
    { id: "usuarios", label: "Pacientes", icon: faUsers },
    { id: "questionarios", label: "Questionários", icon: faClipboardQuestion },
  ];

  function Loading() {
    return <div className={styles.loadingBlock}><FontAwesomeIcon icon={faSpinner} spin /><span>Carregando...</span></div>;
  }

  function Erro({ msg, onRetry }: { msg: string; onRetry: () => void }) {
    return <div className={styles.erroBlock}><span>{msg}</span><button onClick={onRetry} className={styles.retryBtn}>Tentar novamente</button></div>;
  }

  return (
    <div className={styles.layout}>

      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <img src={logo} alt="Umanizzare" className={styles.logoImage} />
          <h1 className={styles.brandName}>Umanizzare</h1>
        </div>
        <nav className={styles.nav}>
          {navItems.map(item => (
            <button key={item.id} className={`${styles.navLink} ${aba === item.id ? styles.active : ""}`} onClick={() => setAba(item.id as Aba)}>
              <FontAwesomeIcon icon={item.icon} className={styles.navIcon} />{item.label}
            </button>
          ))}
          <div className={`${styles.navLink} ${styles.navUser}`}>
            <div className={styles.navAvatarPlaceholder}>{iniciais}</div>
            <span>Olá, {primeiroNome}</span>
          </div>
          <button className={styles.navLink} onClick={() => navigate("/settings")}>
            <FontAwesomeIcon icon={faGear} className={styles.navIcon} />Configurações
          </button>
          <button onClick={handleLogout} className={`${styles.navLink} ${styles.navLogout}`}>
            <FontAwesomeIcon icon={faRightFromBracket} className={styles.navIcon} />Sair
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <main className={styles.content}>

        {/* ── CONSULTAS DE HOJE ── */}
        {aba === "hoje" && (
          <div className={styles.abaSection}>
            <div className={styles.abaCabecalho}>
              <h2 className={styles.abaTitle}><FontAwesomeIcon icon={faCalendarDay} /> Consultas de hoje</h2>
              <p className={styles.abaSub}>{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
            </div>

            {/* STATS */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: "#fdecea" }}><FontAwesomeIcon icon={faCalendarCheck} style={{ color: "#800020" }} /></div>
                <div><p className={styles.statLabel}>Total hoje</p><h3 className={styles.statNumber}>{loadingConsultas ? "..." : consultas.length}</h3></div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: "#e8f5e9" }}><FontAwesomeIcon icon={faCheckCircle} style={{ color: "#2e7d32" }} /></div>
                <div><p className={styles.statLabel}>Realizadas</p><h3 className={styles.statNumber}>{loadingConsultas ? "..." : consultasRealizadas.length}</h3></div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: "#fff8e1" }}><FontAwesomeIcon icon={faClock} style={{ color: "#b45309" }} /></div>
                <div><p className={styles.statLabel}>Pendentes</p><h3 className={styles.statNumber}>{loadingConsultas ? "..." : consultasPendentes.length}</h3></div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: "#fdecea" }}><FontAwesomeIcon icon={faXmarkCircle} style={{ color: "#c0392b" }} /></div>
                <div><p className={styles.statLabel}>Canceladas</p><h3 className={styles.statNumber}>{loadingConsultas ? "..." : consultasCanceladas.length}</h3></div>
              </div>
            </div>

            {loadingConsultas && <Loading />}
            {erroConsultas && <Erro msg={erroConsultas} onRetry={carregarConsultasHoje} />}

            {!loadingConsultas && !erroConsultas && consultas.length === 0 && (
              <div className={styles.emptyState}>
                <FontAwesomeIcon icon={faCalendarDay} className={styles.emptyIcon} />
                <p>Nenhuma consulta agendada para hoje.</p>
              </div>
            )}

            <div className={styles.consultaList}>
              {consultas
                .sort((a, b) => a.horario.localeCompare(b.horario))
                .map(c => {
                  const paciente = c.pacientes?.[0].paciente;
                  const nomePaciente = paciente?.name || "Paciente";
                  const inicialP = nomePaciente[0].toUpperCase();
                  return (
                    <div key={c.id} className={styles.consultaItem}>
                      <div className={styles.consultaHorarioBox}>
                        <FontAwesomeIcon icon={faClock} style={{ color: "#800020", marginBottom: 4 }} />
                        <span className={styles.consultaHorario}>{c.horario}</span>
                      </div>
                      <div className={styles.consultaAvatar}>{inicialP}</div>
                      <div className={styles.consultaInfo}>
                        <p className={styles.consultaNome}>{nomePaciente}</p>
                        <p className={styles.consultaTipo}>Sessão de Psicologia</p>
                      </div>
                      <span className={
                        c.status === "realizada" || c.status === "confirmada" ? styles.badgeGreen
                          : c.status === "cancelada" ? styles.badgeRed
                            : styles.badgeAmber
                      }>
                        {c.status || "Pendente"}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ── PACIENTES ── */}
        {aba === "usuarios" && (
          <div className={styles.abaSection}>
            <div className={styles.abaCabecalho}>
              <h2 className={styles.abaTitle}><FontAwesomeIcon icon={faUsers} /> Pacientes</h2>
              <p className={styles.abaSub}>Gerencie e agende consultas</p>
            </div>

            <div className={styles.searchWrapper}>
              <input type="text" placeholder="Buscar paciente..." value={searchUser} onChange={e => setSearchUser(e.target.value)} className={styles.searchInput} />
            </div>

            {loadingUsuarios && <Loading />}
            {erroUsuarios && <Erro msg={erroUsuarios} onRetry={carregarUsuarios} />}

            <div className={styles.pacienteList}>
              {usuariosFiltrados.map(u => (
                <div key={u.id} className={styles.pacienteItem}>
                  <div className={styles.pacienteAvatar}>{u.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}</div>
                  <div className={styles.pacienteInfo}>
                    <p className={styles.pacienteNome}>{u.name}</p>
                    <p className={styles.pacienteEmail}>{u.email}</p>
                  </div>
                  <button className={styles.btnAgendar} onClick={() => { setModalConsulta(u); setErroConsultaModal(""); }}>
                    <FontAwesomeIcon icon={faCalendarPlus} style={{ marginRight: 6 }} />Agendar consulta
                  </button>
                </div>
              ))}
              {!loadingUsuarios && usuariosFiltrados.length === 0 && (
                <div className={styles.emptyState}><FontAwesomeIcon icon={faUsers} className={styles.emptyIcon} /><p>Nenhuma paciente encontrada.</p></div>
              )}
            </div>
          </div>
        )}

        {/* ── QUESTIONÁRIOS ── */}
        {aba === "questionarios" && (
          <div className={styles.abaSection}>
            <div className={styles.abaCabecalho}>
              <h2 className={styles.abaTitle}><FontAwesomeIcon icon={faClipboardQuestion} /> Questionários</h2>
              <p className={styles.abaSub}>Questionários disponíveis no sistema</p>
            </div>

            {loadingQ && <Loading />}
            {erroQ && <Erro msg={erroQ} onRetry={carregarQuestionarios} />}

            <div className={styles.qList}>
              {questionarios.map(q => (
                <div key={q.id} className={styles.qItem}>
                  <div className={styles.qIconBox}><FontAwesomeIcon icon={faClipboardList} /></div>
                  <div className={styles.qInfo}>
                    <p className={styles.qTitulo}>{q.title}</p>
                    <p className={styles.qId}>ID #{q.id}</p>
                  </div>
                  <button className={styles.btnVerQ} onClick={() => navigate(`/admin/questionnaires`)}>
                    Gerenciar
                  </button>
                </div>
              ))}
              {!loadingQ && questionarios.length === 0 && (
                <div className={styles.emptyState}><FontAwesomeIcon icon={faClipboardQuestion} className={styles.emptyIcon} /><p>Nenhum questionário encontrado.</p></div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* MODAL AGENDAR CONSULTA */}
      {modalConsulta && (
        <div className={styles.modalOverlay} onClick={() => setModalConsulta(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3><FontAwesomeIcon icon={faCalendarPlus} style={{ marginRight: 8, color: "#800020" }} />Agendar Consulta</h3>
              <button onClick={() => setModalConsulta(null)} className={styles.modalClose}><FontAwesomeIcon icon={faXmark} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalAvatar}>{modalConsulta.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}</div>
              <p style={{ textAlign: "center", fontWeight: 600, marginBottom: 20 }}>{modalConsulta.name}</p>
              {erroConsultaModal && <div className={styles.erroInline}>{erroConsultaModal}</div>}
              <div className={styles.formField}>
                <label className={styles.formLabel}>Data *</label>
                <input type="date" value={consultaData} onChange={e => setConsultaData(e.target.value)} className={styles.formInput} min={hoje()} />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Horário *</label>
                <input type="time" value={consultaHorario} onChange={e => setConsultaHorario(e.target.value)} className={styles.formInput} />
              </div>
              <div className={styles.modalFooter}>
                <button onClick={() => setModalConsulta(null)} className={styles.btnCancel}>Cancelar</button>
                <button onClick={handleAgendarConsulta} disabled={salvandoConsulta} className={styles.btnSave}>
                  {salvandoConsulta ? <><FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 6 }} />Agendando...</> : "Agendar consulta"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}