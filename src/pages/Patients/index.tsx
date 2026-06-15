import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers, faCalendarCheck, faCalendarPlus, faCalendarXmark,
  faClipboardList, faCheckCircle, faHeart, faHome, faCalendar,
  faChartBar, faCog, faSignOutAlt, faMagnifyingGlass, faPhone,
  faMapMarkerAlt, faXmark, faSpinner, faTrash, faEye, faFileAlt,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../services/api";
import logo from "../../assets/images/brand.png";
import styles from "./styles.module.css";

const BASE_URL = "http://147.93.9.44:8002";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("@Umanizzare:token");
  return token ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` } : { "Content-Type": "application/json" };
}

type Paciente = {
  id: string; name?: string; nome?: string; email: string;
  telefone?: string; idade?: number; endereco?: string; role?: string;
  cpf?: string; genero?: string; funcao_atual?: string; estado_civil?: string;
  grau_de_escolaridade?: string; data_do_Acolhimento?: string;
  equipe_de_atendimento?: string; orgao_responsavel_pelo_encaminhamento?: string;
  orientacao_sexual?: string; identificacao_etnico_racial?: string;
  tem_interesse_em_participar_das_oficinas_do_instituto?: string;
};

type Psicologo = { id: number; nome: string; email: string; crp?: string; };
type Aba = "lista" | "tarefas" | "oficinas" | "relatorios";

export function Patients() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("@Umanizzare:name") || "Profissional";
  const primeiroNome = userName.split(" ")[0];
  const iniciais = userName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

  const [aba, setAba] = useState<Aba>("lista");
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [psicologos, setPsicologos] = useState<Psicologo[]>([]);
  const [search, setSearch] = useState("");
  const [viewPaciente, setViewPaciente] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [deletandoId, setDeletandoId] = useState<string | null>(null);

  // Modal Consulta
  const [modalConsulta, setModalConsulta] = useState<Paciente | null>(null);
  const [consultaData, setConsultaData] = useState("");
  const [consultaHorario, setConsultaHorario] = useState("");
  const [consultaPsicologoId, setConsultaPsicologoId] = useState("");
  const [salvandoConsulta, setSalvandoConsulta] = useState(false);
  const [erroConsulta, setErroConsulta] = useState("");

  // Modal Tarefa
  const [modalTarefa, setModalTarefa] = useState<Paciente | null>(null);
  const [tarefaTitulo, setTarefaTitulo] = useState("");
  const [tarefaDescricao, setTarefaDescricao] = useState("");
  const [salvandoTarefa, setSalvandoTarefa] = useState(false);
  const [erroTarefa, setErroTarefa] = useState("");

  useEffect(() => { carregarPacientes(); carregarPsicologos(); }, []);

  async function carregarPacientes() {
    try {
      setLoading(true); setErro("");
      const data = await apiService.getUsers();
      const lista = Array.isArray(data) ? data : data.users || data.data || [];
      setPacientes(lista.filter((u: Paciente) => u.role !== "ADMIN"));
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao carregar pacientes.");
    } finally { setLoading(false); }
  }

  async function carregarPsicologos() {
    try {
      const resp = await fetch(`${BASE_URL}/psicologos?limit=9999`, { headers: getAuthHeaders() });
      if (resp.ok) {
        const data = await resp.json();
        setPsicologos(Array.isArray(data) ? data : data.psicologos || []);
      }
    } catch {}
  }

  async function handleDeletar(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta paciente?")) return;
    try {
      setDeletandoId(id);
      await apiService.deleteUser(id);
      setPacientes(prev => prev.filter(p => p.id !== id));
      if (viewPaciente?.id === id) setViewPaciente(null);
    } catch (err) { alert(err instanceof Error ? err.message : "Erro ao deletar."); }
    finally { setDeletandoId(null); }
  }

  async function handleAgendarConsulta() {
    if (!modalConsulta || !consultaData || !consultaHorario) {
      setErroConsulta("Preencha data e horário."); return;
    }
    try {
      setSalvandoConsulta(true); setErroConsulta("");
      // 1. Cria a consulta
      const resp = await fetch(`${BASE_URL}/consultas`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          data: consultaData,
          horario: consultaHorario,
          psicologoId: consultaPsicologoId ? Number(consultaPsicologoId) : undefined,
        }),
      });
      const consulta = await resp.json();
      if (!resp.ok) throw new Error(consulta.message || "Erro ao criar consulta.");

      // 2. Adiciona a paciente à consulta
      const resp2 = await fetch(`${BASE_URL}/consultas/${consulta.id}/pacientes`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ pacienteId: Number(modalConsulta.id) }),
      });
      if (!resp2.ok) {
        const d = await resp2.json();
        throw new Error(d.message || "Erro ao vincular paciente.");
      }

      alert(`Consulta agendada para ${modalConsulta.name || modalConsulta.nome} em ${consultaData} às ${consultaHorario}!`);
      setModalConsulta(null);
      setConsultaData(""); setConsultaHorario(""); setConsultaPsicologoId("");
    } catch (err) {
      setErroConsulta(err instanceof Error ? err.message : "Erro ao agendar consulta.");
    } finally { setSalvandoConsulta(false); }
  }

  async function handleAtribuirTarefa() {
    if (!modalTarefa || !tarefaTitulo.trim()) {
      setErroTarefa("Preencha o título da tarefa."); return;
    }
    try {
      setSalvandoTarefa(true); setErroTarefa("");
      const resp = await fetch(`${BASE_URL}/tarefas`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ titulo: tarefaTitulo, descricao: tarefaDescricao }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || "Erro ao criar tarefa.");

      alert(`Tarefa "${tarefaTitulo}" criada com sucesso!`);
      setModalTarefa(null);
      setTarefaTitulo(""); setTarefaDescricao("");
    } catch (err) {
      setErroTarefa(err instanceof Error ? err.message : "Erro ao criar tarefa.");
    } finally { setSalvandoTarefa(false); }
  }

  function handleLogout() {
    localStorage.removeItem("@Umanizzare:token");
    localStorage.removeItem("@Umanizzare:role");
    localStorage.removeItem("@Umanizzare:name");
    localStorage.removeItem("@Umanizzare:picture");
    navigate("/login");
    window.location.reload();
  }

  const getNome = (p: Paciente) => p.name || p.nome || "Sem nome";
  const getIniciais = (p: Paciente) => getNome(p).split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

  const filtered = pacientes.filter(p =>
    getNome(p).toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  const navItems = [
    { id: "lista", label: "Pacientes", icon: faUsers },
    { id: "tarefas", label: "Tarefas", icon: faClipboardList },
    { id: "oficinas", label: "Oficinas", icon: faCalendar },
    { id: "relatorios", label: "Relatórios", icon: faChartBar },
  ];

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
            <FontAwesomeIcon icon={faCog} className={styles.navIcon} />Configurações
          </button>
          <button onClick={handleLogout} className={`${styles.navLink} ${styles.navLogout}`}>
            <FontAwesomeIcon icon={faSignOutAlt} className={styles.navIcon} />Sair
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <div className={styles.main}>
        <main className={styles.content}>

          {/* ABA LISTA */}
          {aba === "lista" && (
            <div className={styles.abaSection}>
              <div className={styles.abaCabecalho}>
                <h2 className={styles.abaTitle}><FontAwesomeIcon icon={faUsers} /> Pacientes</h2>
                <p className={styles.abaSub}>Gerencie e acompanhe suas pacientes.</p>
              </div>

              <div className={styles.statsGrid}>
                {[
                  { label: "Total de pacientes", value: loading ? "..." : pacientes.length, color: "#fdecea", iconColor: "#800020", icon: faUsers },
                  { label: "Pacientes ativas", value: loading ? "..." : pacientes.length, color: "#e8f5e9", iconColor: "#2e7d32", icon: faCheckCircle },
                  { label: "Consultas esta semana", value: "—", color: "#e3f2fd", iconColor: "#1565c0", icon: faCalendarPlus },
                  { label: "Tarefas atribuídas", value: "—", color: "#f3e5f5", iconColor: "#6a1b9a", icon: faClipboardList },
                ].map(s => (
                  <div key={s.label} className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: s.color }}>
                      <FontAwesomeIcon icon={s.icon} style={{ color: s.iconColor, fontSize: "1.1rem" }} />
                    </div>
                    <div><p className={styles.statLabel}>{s.label}</p><h3 className={styles.statNumber}>{s.value}</h3></div>
                  </div>
                ))}
              </div>

              <div className={styles.searchWrapper}>
                <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
                <input type="text" placeholder="Buscar paciente por nome ou e-mail..." value={search} onChange={e => setSearch(e.target.value)} className={styles.searchInput} />
              </div>

              {loading && <div className={styles.loadingBlock}><FontAwesomeIcon icon={faSpinner} spin className={styles.loadingIcon} /><span>Carregando pacientes...</span></div>}
              {erro && <div className={styles.erroBlock}><span>{erro}</span><button onClick={carregarPacientes} className={styles.retryBtn}>Tentar novamente</button></div>}

              {!loading && !erro && (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr><th>Paciente</th><th>Contato</th><th>Idade</th><th>Endereço</th><th>Status</th><th>Ações</th></tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#888" }}>Nenhuma paciente encontrada.</td></tr>
                      ) : filtered.map(p => (
                        <tr key={p.id}>
                          <td>
                            <div className={styles.userInfo}>
                              <div className={styles.avatar}>{getIniciais(p)}</div>
                              <div><p className={styles.userName}>{getNome(p)}</p><p className={styles.userEmail}>{p.email}</p></div>
                            </div>
                          </td>
                          <td><p style={{ margin: 0, fontSize: "0.85rem", color: "#555" }}><FontAwesomeIcon icon={faPhone} style={{ marginRight: 4, color: "#800020" }} />{p.telefone || "—"}</p></td>
                          <td style={{ fontSize: "0.85rem" }}>{p.idade ? `${p.idade} anos` : "—"}</td>
                          <td style={{ fontSize: "0.85rem", color: "#555" }}>{p.endereco ? <><FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: 4, color: "#800020" }} />{p.endereco}</> : "—"}</td>
                          <td><span className={styles.badgeGreen}>Ativa</span></td>
                          <td>
                            <div className={styles.tableActions}>
                              <button className={styles.actionBtn} title="Ver prontuário" onClick={() => setViewPaciente(p)}><FontAwesomeIcon icon={faEye} /></button>
                              <button className={styles.actionBtn} title="Agendar consulta" onClick={() => { setModalConsulta(p); setErroConsulta(""); }}><FontAwesomeIcon icon={faCalendarPlus} /></button>
                              <button className={styles.actionBtn} title="Atribuir tarefa" onClick={() => { setModalTarefa(p); setErroTarefa(""); }}><FontAwesomeIcon icon={faClipboardList} /></button>
                              <button className={styles.actionBtn} title="Excluir" style={{ color: "#c0392b" }} onClick={() => handleDeletar(p.id)} disabled={deletandoId === p.id}>
                                <FontAwesomeIcon icon={deletandoId === p.id ? faSpinner : faTrash} spin={deletandoId === p.id} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* CARDS MOBILE */}
              {!loading && !erro && (
                <div className={styles.cardList}>
                  {filtered.map(p => (
                    <div key={p.id} className={styles.mobileCard}>
                      <div className={styles.mobileCardHeader}>
                        <div className={styles.avatar}>{getIniciais(p)}</div>
                        <div style={{ flex: 1 }}><p className={styles.userName}>{getNome(p)}</p><p className={styles.userEmail}>{p.email}</p></div>
                        <span className={styles.badgeGreen}>Ativa</span>
                      </div>
                      <div className={styles.mobileCardActions}>
                        <button className={styles.actionBtn} onClick={() => setViewPaciente(p)}><FontAwesomeIcon icon={faEye} /></button>
                        <button className={styles.actionBtn} onClick={() => { setModalConsulta(p); setErroConsulta(""); }}><FontAwesomeIcon icon={faCalendarPlus} /></button>
                        <button className={styles.actionBtn} onClick={() => { setModalTarefa(p); setErroTarefa(""); }}><FontAwesomeIcon icon={faClipboardList} /></button>
                        <button className={styles.actionBtn} style={{ color: "#c0392b" }} onClick={() => handleDeletar(p.id)}><FontAwesomeIcon icon={faTrash} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABAS FUTURAS */}
          {aba !== "lista" && (
            <div className={styles.abaSection}>
              <div className={styles.abaCabecalho}>
                <h2 className={styles.abaTitle}><FontAwesomeIcon icon={navItems.find(n => n.id === aba)?.icon || faUsers} /> {navItems.find(n => n.id === aba)?.label}</h2>
                <p className={styles.abaSub}>Funcionalidade em desenvolvimento.</p>
              </div>
              <div className={styles.emptyState}><FontAwesomeIcon icon={faCalendarXmark} className={styles.emptyIcon} /><p>Em breve disponível.</p></div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL PRONTUÁRIO */}
      {viewPaciente && (
        <div className={styles.modalOverlay} onClick={() => setViewPaciente(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Prontuário — {getNome(viewPaciente)}</h3>
              <button onClick={() => setViewPaciente(null)} className={styles.modalClose}><FontAwesomeIcon icon={faXmark} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalAvatar}>{getIniciais(viewPaciente)}</div>
              <div className={styles.modalGrid}>
                {[
                  { label: "Nome", value: getNome(viewPaciente) },
                  { label: "E-mail", value: viewPaciente.email },
                  { label: "CPF", value: viewPaciente.cpf },
                  { label: "Idade", value: viewPaciente.idade ? `${viewPaciente.idade} anos` : null },
                  { label: "Telefone", value: viewPaciente.telefone },
                  { label: "Gênero", value: viewPaciente.genero },
                  { label: "Estado Civil", value: viewPaciente.estado_civil },
                  { label: "Escolaridade", value: viewPaciente.grau_de_escolaridade },
                  { label: "Função Atual", value: viewPaciente.funcao_atual },
                  { label: "Endereço", value: viewPaciente.endereco },
                  { label: "Equipe de Atendimento", value: viewPaciente.equipe_de_atendimento },
                  { label: "Órgão de Encaminhamento", value: viewPaciente.orgao_responsavel_pelo_encaminhamento },
                  { label: "Data do Acolhimento", value: viewPaciente.data_do_Acolhimento },
                  { label: "Interesse em Oficinas", value: viewPaciente.tem_interesse_em_participar_das_oficinas_do_instituto },
                  { label: "Identif. Étnico-Racial", value: viewPaciente.identificacao_etnico_racial },
                  { label: "Orientação Sexual", value: viewPaciente.orientacao_sexual },
                ].filter(item => item.value).map(item => (
                  <div key={item.label} className={styles.modalField}>
                    <span className={styles.modalFieldLabel}>{item.label}</span>
                    <span className={styles.modalFieldValue}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGENDAR CONSULTA */}
      {modalConsulta && (
        <div className={styles.modalOverlay} onClick={() => setModalConsulta(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3><FontAwesomeIcon icon={faCalendarPlus} style={{ marginRight: 8, color: "#800020" }} />Agendar Consulta</h3>
              <button onClick={() => setModalConsulta(null)} className={styles.modalClose}><FontAwesomeIcon icon={faXmark} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalAvatar}>{getIniciais(modalConsulta)}</div>
              <p style={{ textAlign: "center", fontWeight: 600, marginBottom: 20, color: "#1a1a1a" }}>{getNome(modalConsulta)}</p>

              {erroConsulta && <div className={styles.erroBlock} style={{ marginBottom: 16 }}>{erroConsulta}</div>}

              <div className={styles.formField}>
                <label className={styles.formLabel}>Data *</label>
                <input type="date" value={consultaData} onChange={e => setConsultaData(e.target.value)} className={styles.formInput} min={new Date().toISOString().split("T")[0]} />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Horário *</label>
                <input type="time" value={consultaHorario} onChange={e => setConsultaHorario(e.target.value)} className={styles.formInput} />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Psicóloga responsável</label>
                <select value={consultaPsicologoId} onChange={e => setConsultaPsicologoId(e.target.value)} className={styles.formInput}>
                  <option value="">Selecione (opcional)</option>
                  {psicologos.map(ps => (
                    <option key={ps.id} value={ps.id}>{ps.nome} {ps.crp ? `— CRP ${ps.crp}` : ""}</option>
                  ))}
                </select>
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

      {/* MODAL ATRIBUIR TAREFA */}
      {modalTarefa && (
        <div className={styles.modalOverlay} onClick={() => setModalTarefa(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3><FontAwesomeIcon icon={faClipboardList} style={{ marginRight: 8, color: "#800020" }} />Atribuir Tarefa</h3>
              <button onClick={() => setModalTarefa(null)} className={styles.modalClose}><FontAwesomeIcon icon={faXmark} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalAvatar}>{getIniciais(modalTarefa)}</div>
              <p style={{ textAlign: "center", fontWeight: 600, marginBottom: 20, color: "#1a1a1a" }}>{getNome(modalTarefa)}</p>

              {erroTarefa && <div className={styles.erroBlock} style={{ marginBottom: 16 }}>{erroTarefa}</div>}

              <div className={styles.formField}>
                <label className={styles.formLabel}>Título da tarefa *</label>
                <input type="text" placeholder="Ex: Diário de emoções" value={tarefaTitulo} onChange={e => setTarefaTitulo(e.target.value)} className={styles.formInput} />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Descrição</label>
                <textarea rows={4} placeholder="Descreva a tarefa para a paciente..." value={tarefaDescricao} onChange={e => setTarefaDescricao(e.target.value)} className={styles.formInput} style={{ resize: "vertical" }} />
              </div>

              <div className={styles.modalFooter}>
                <button onClick={() => setModalTarefa(null)} className={styles.btnCancel}>Cancelar</button>
                <button onClick={handleAtribuirTarefa} disabled={salvandoTarefa} className={styles.btnSave}>
                  {salvandoTarefa ? <><FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 6 }} />Salvando...</> : "Atribuir tarefa"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}