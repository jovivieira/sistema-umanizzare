import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck, faUsers, faClipboardList, faGear,
  faRightFromBracket, faSpinner, faCalendarDay,
  faCheckCircle, faXmarkCircle, faClock,
  faClipboardQuestion, faCalendarPlus, faUserTie,
} from "@fortawesome/free-solid-svg-icons";
import { apiService } from "../../services/api";
import logo from "../../assets/images/brand.png";
import styles from "./styles.module.css";

const BASE_URL = "http://147.93.9.44:8002";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("@Umanizzare:token");
  return token ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` } : { "Content-Type": "application/json" };
}

type Aba = "hoje" | "nova-consulta" | "usuarios" | "questionarios";

type Consulta = {
  id: number; data: string; horario: string; status?: string;
  pacientes?: { id: number; pacienteId?: number; paciente?: any; }[];
  psicologo?: { name?: string; nome?: string; };
};

type User = {
  id: string; name: string; email: string;
  role: "USER" | "ADMIN" | "PSICOLOGO" | "PACIENTE";
};

type Questionario = { id: number; title: string; };

function hoje() {
  return new Date().toISOString().split("T")[0];
}

function formatarData(data: string) {
  if (!data) return "—";
  try { return new Date(data).toLocaleDateString("pt-BR"); } catch { return data; }
}

export function PsychologistDashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("@Umanizzare:name") || "Psicólogo";
  const userId   = localStorage.getItem("@Umanizzare:id") || "";
  const primeiroNome = userName.split(" ")[0];
  const iniciais = userName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

  const [aba, setAba] = useState<Aba>("hoje");

  // Consultas de hoje
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loadingConsultas, setLoadingConsultas] = useState(true);
  const [erroConsultas, setErroConsultas] = useState("");

  // Usuários/Pacientes
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [erroUsuarios, setErroUsuarios] = useState("");
  const [searchUser, setSearchUser] = useState("");

  // Questionários
  const [questionarios, setQuestionarios] = useState<Questionario[]>([]);
  const [loadingQ, setLoadingQ] = useState(false);
  const [erroQ, setErroQ] = useState("");

  // Nova consulta
  const [novaData, setNovaData] = useState("");
  const [novaHorario, setNovaHorario] = useState("");
  const [novaPacienteId, setNovaPacienteId] = useState("");
  const [salvandoNova, setSalvandoNova] = useState(false);
  const [erroNova, setErroNova] = useState("");
  const [sucessoNova, setSucessoNova] = useState(false);

  useEffect(() => { carregarConsultasHoje(); carregarUsuarios(); }, []);

  useEffect(() => {
    if (aba === "questionarios" && questionarios.length === 0) carregarQuestionarios();
  }, [aba]);

  async function carregarConsultasHoje() {
    try {
      setLoadingConsultas(true); setErroConsultas("");
      const resp = await fetch(`${BASE_URL}/consultas?limit=9999`, { headers: getAuthHeaders() });
      if (!resp.ok) throw new Error("Erro ao buscar consultas.");
      const data = await resp.json();
      const lista: Consulta[] = Array.isArray(data) ? data : data.consultas || data.data || [];
      setConsultas(lista.filter(c => c.data?.startsWith(hoje())));
    } catch (err) {
      setErroConsultas(err instanceof Error ? err.message : "Erro ao carregar consultas.");
    } finally { setLoadingConsultas(false); }
  }

  async function carregarUsuarios() {
    try {
      setLoadingUsuarios(true); setErroUsuarios("");
      const data = await apiService.getUsers();
      const lista = Array.isArray(data) ? data : data.users || [];
      setUsuarios(lista.filter((u: User) => u.role !== "ADMIN" && u.role !== "PSICOLOGO"));
    } catch (err) {
      setErroUsuarios(err instanceof Error ? err.message : "Erro ao carregar pacientes.");
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

  async function handleCriarConsulta() {
    if (!novaData || !novaHorario || !novaPacienteId) {
      setErroNova("Preencha data, horário e selecione uma paciente."); return;
    }
    try {
      setSalvandoNova(true); setErroNova(""); setSucessoNova(false);

      // 1. Cria a consulta com o psicólogo logado
      const resp = await fetch(`${BASE_URL}/consultas`, {
        method: "POST", headers: getAuthHeaders(),
        body: JSON.stringify({
          data: novaData,
          horario: novaHorario,
          psicologoId: userId ? Number(userId) : undefined,
        }),
      });
      const consulta = await resp.json();
      if (!resp.ok) throw new Error(consulta.message || "Erro ao criar consulta.");

      // 2. Vincula a paciente
      const resp2 = await fetch(`${BASE_URL}/consultas/${consulta.id}/pacientes`, {
        method: "POST", headers: getAuthHeaders(),
        body: JSON.stringify({ pacienteId: Number(novaPacienteId) }),
      });
      if (!resp2.ok) { const d = await resp2.json(); throw new Error(d.message || "Erro ao vincular paciente."); }

      setSucessoNova(true);
      setNovaData(""); setNovaHorario(""); setNovaPacienteId("");
      // Atualiza consultas de hoje se a data for hoje
      if (novaData === hoje()) carregarConsultasHoje();
    } catch (err) {
      setErroNova(err instanceof Error ? err.message : "Erro ao criar consulta.");
    } finally { setSalvandoNova(false); }
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
  const consultasPendentes  = consultas.filter(c => !c.status || c.status === "pendente");
  const consultasCanceladas = consultas.filter(c => c.status === "cancelada");

  const usuariosFiltrados = usuarios.filter(u =>
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const pacienteSelecionada = usuarios.find(u => u.id === novaPacienteId);

  const navItems = [
    { id: "hoje",          label: "Consultas de Hoje", icon: faCalendarDay },
    { id: "nova-consulta", label: "Nova Consulta",     icon: faCalendarPlus },
    { id: "usuarios",      label: "Pacientes",         icon: faUsers },
    { id: "questionarios", label: "Questionários",     icon: faClipboardQuestion },
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

            <div className={styles.statsGrid}>
              <div className={styles.statCard}><div className={styles.statIcon} style={{ background: "#fdecea" }}><FontAwesomeIcon icon={faCalendarCheck} style={{ color: "#800020" }} /></div><div><p className={styles.statLabel}>Total hoje</p><h3 className={styles.statNumber}>{loadingConsultas ? "..." : consultas.length}</h3></div></div>
              <div className={styles.statCard}><div className={styles.statIcon} style={{ background: "#e8f5e9" }}><FontAwesomeIcon icon={faCheckCircle} style={{ color: "#2e7d32" }} /></div><div><p className={styles.statLabel}>Realizadas</p><h3 className={styles.statNumber}>{loadingConsultas ? "..." : consultasRealizadas.length}</h3></div></div>
              <div className={styles.statCard}><div className={styles.statIcon} style={{ background: "#fff8e1" }}><FontAwesomeIcon icon={faClock} style={{ color: "#b45309" }} /></div><div><p className={styles.statLabel}>Pendentes</p><h3 className={styles.statNumber}>{loadingConsultas ? "..." : consultasPendentes.length}</h3></div></div>
              <div className={styles.statCard}><div className={styles.statIcon} style={{ background: "#fdecea" }}><FontAwesomeIcon icon={faXmarkCircle} style={{ color: "#c0392b" }} /></div><div><p className={styles.statLabel}>Canceladas</p><h3 className={styles.statNumber}>{loadingConsultas ? "..." : consultasCanceladas.length}</h3></div></div>
            </div>

            {loadingConsultas && <Loading />}
            {erroConsultas && <Erro msg={erroConsultas} onRetry={carregarConsultasHoje} />}
            {!loadingConsultas && !erroConsultas && consultas.length === 0 && (
              <div className={styles.emptyState}>
                <FontAwesomeIcon icon={faCalendarDay} className={styles.emptyIcon} />
                <p>Nenhuma consulta agendada para hoje.</p>
                <button className={styles.btnNovaConsulta} onClick={() => setAba("nova-consulta")}>
                  <FontAwesomeIcon icon={faCalendarPlus} style={{ marginRight: 8 }} />Agendar nova consulta
                </button>
              </div>
            )}

            <div className={styles.consultaList}>
              {consultas.sort((a, b) => a.horario.localeCompare(b.horario)).map(c => {
                const paciente = c.pacientes?.[0]?.paciente;
                const nomePaciente = paciente?.name || paciente?.nome || "Paciente";
                return (
                  <div key={c.id} className={styles.consultaItem}>
                    <div className={styles.consultaHorarioBox}>
                      <FontAwesomeIcon icon={faClock} style={{ color: "#800020", marginBottom: 4 }} />
                      <span className={styles.consultaHorario}>{c.horario}</span>
                    </div>
                    <div className={styles.consultaAvatar}>{nomePaciente[0].toUpperCase()}</div>
                    <div className={styles.consultaInfo}>
                      <p className={styles.consultaNome}>{nomePaciente}</p>
                      <p className={styles.consultaTipo}>
                        <FontAwesomeIcon icon={faUserTie} style={{ marginRight: 4, color: "#800020" }} />
                        {userName}
                      </p>
                    </div>
                    <span className={c.status === "realizada" || c.status === "confirmada" ? styles.badgeGreen : c.status === "cancelada" ? styles.badgeRed : styles.badgeAmber}>
                      {c.status || "Pendente"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── NOVA CONSULTA ── */}
        {aba === "nova-consulta" && (
          <div className={styles.abaSection}>
            <div className={styles.abaCabecalho}>
              <h2 className={styles.abaTitle}><FontAwesomeIcon icon={faCalendarPlus} /> Nova Consulta</h2>
              <p className={styles.abaSub}>Agende uma consulta para uma paciente</p>
            </div>

            <div className={styles.novaConsultaCard}>

              {/* PSICÓLOGO (automático) */}
              <div className={styles.novaConsultaSection}>
                <p className={styles.novaConsultaSectionTitle}><FontAwesomeIcon icon={faUserTie} style={{ marginRight: 8, color: "#800020" }} />Psicóloga responsável</p>
                <div className={styles.profissionalBox}>
                  <div className={styles.profissionalAvatar}>{iniciais}</div>
                  <div>
                    <p className={styles.profissionalNome}>{userName}</p>
                    <p className={styles.profissionalLabel}>Psicóloga responsável — preenchido automaticamente</p>
                  </div>
                  <span className={styles.badgeGreen}>Você</span>
                </div>
              </div>

              {/* PACIENTE */}
              <div className={styles.novaConsultaSection}>
                <p className={styles.novaConsultaSectionTitle}><FontAwesomeIcon icon={faUsers} style={{ marginRight: 8, color: "#800020" }} />Selecionar paciente *</p>
                <div className={styles.searchWrapper}>
                  <input type="text" placeholder="Buscar paciente por nome ou e-mail..." value={searchUser} onChange={e => setSearchUser(e.target.value)} className={styles.searchInput} />
                </div>
                {loadingUsuarios && <Loading />}
                <div className={styles.pacienteSelecionarList}>
                  {usuariosFiltrados.slice(0, 8).map(u => (
                    <button
                      key={u.id}
                      className={`${styles.pacienteSelecionarItem} ${novaPacienteId === u.id ? styles.pacienteSelecionarItemAtivo : ""}`}
                      onClick={() => setNovaPacienteId(u.id)}
                    >
                      <div className={styles.pacienteAvatar}>{u.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}</div>
                      <div className={styles.pacienteInfo}>
                        <p className={styles.pacienteNome}>{u.name}</p>
                        <p className={styles.pacienteEmail}>{u.email}</p>
                      </div>
                      {novaPacienteId === u.id && <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#800020", fontSize: "1.1rem" }} />}
                    </button>
                  ))}
                  {!loadingUsuarios && usuariosFiltrados.length === 0 && <p style={{ color: "#aaa", padding: "16px 0" }}>Nenhuma paciente encontrada.</p>}
                </div>
              </div>

              {/* DATA E HORÁRIO */}
              <div className={styles.novaConsultaSection}>
                <p className={styles.novaConsultaSectionTitle}><FontAwesomeIcon icon={faCalendarCheck} style={{ marginRight: 8, color: "#800020" }} />Data e horário *</p>
                <div className={styles.novaConsultaGrid}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Data</label>
                    <input type="date" value={novaData} onChange={e => setNovaData(e.target.value)} className={styles.formInput} min={hoje()} />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Horário</label>
                    <input type="time" value={novaHorario} onChange={e => setNovaHorario(e.target.value)} className={styles.formInput} />
                  </div>
                </div>
              </div>

              {/* RESUMO */}
              {(novaPacienteId || novaData || novaHorario) && (
                <div className={styles.resumoConsulta}>
                  <p className={styles.resumoConsultaTitulo}>Resumo da consulta</p>
                  <div className={styles.resumoConsultaGrid}>
                    <div><span className={styles.resumoLabel}>Psicóloga</span><span className={styles.resumoValor}>{userName}</span></div>
                    <div><span className={styles.resumoLabel}>Paciente</span><span className={styles.resumoValor}>{pacienteSelecionada?.name || "—"}</span></div>
                    <div><span className={styles.resumoLabel}>Data</span><span className={styles.resumoValor}>{novaData ? formatarData(novaData) : "—"}</span></div>
                    <div><span className={styles.resumoLabel}>Horário</span><span className={styles.resumoValor}>{novaHorario || "—"}</span></div>
                  </div>
                </div>
              )}

              {erroNova && <div className={styles.erroInline}>{erroNova}</div>}

              {sucessoNova && (
                <div className={styles.sucessoInline}>
                  <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: 8 }} />
                  Consulta agendada com sucesso!
                </div>
              )}

              <div className={styles.novaConsultaFooter}>
                <button onClick={handleCriarConsulta} disabled={salvandoNova} className={styles.btnCriarConsulta}>
                  {salvandoNova ? <><FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 8 }} />Agendando...</> : <><FontAwesomeIcon icon={faCalendarPlus} style={{ marginRight: 8 }} />Agendar consulta</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── PACIENTES ── */}
        {aba === "usuarios" && (
          <div className={styles.abaSection}>
            <div className={styles.abaCabecalho}>
              <h2 className={styles.abaTitle}><FontAwesomeIcon icon={faUsers} /> Pacientes</h2>
              <p className={styles.abaSub}>Lista de pacientes cadastradas</p>
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
                  <div className={styles.pacienteInfo}><p className={styles.pacienteNome}>{u.name}</p><p className={styles.pacienteEmail}>{u.email}</p></div>
                  <button className={styles.btnAgendar} onClick={() => { setNovaPacienteId(u.id); setAba("nova-consulta"); }}>
                    <FontAwesomeIcon icon={faCalendarPlus} style={{ marginRight: 6 }} />Agendar consulta
                  </button>
                </div>
              ))}
              {!loadingUsuarios && usuariosFiltrados.length === 0 && <div className={styles.emptyState}><FontAwesomeIcon icon={faUsers} className={styles.emptyIcon} /><p>Nenhuma paciente encontrada.</p></div>}
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
                  <div className={styles.qInfo}><p className={styles.qTitulo}>{q.title}</p><p className={styles.qId}>ID #{q.id}</p></div>
                  <button className={styles.btnVerQ} onClick={() => navigate(`/admin/questionnaires`)}>Gerenciar</button>
                </div>
              ))}
              {!loadingQ && questionarios.length === 0 && <div className={styles.emptyState}><FontAwesomeIcon icon={faClipboardQuestion} className={styles.emptyIcon} /><p>Nenhum questionário encontrado.</p></div>}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}