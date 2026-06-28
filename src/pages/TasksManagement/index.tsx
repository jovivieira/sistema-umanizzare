import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList, faPlus, faTrash, faPen, faXmark,
  faSpinner, faCheckCircle, faMagnifyingGlass, faEye,
  faChevronDown, faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./styles.module.css";

const BASE_URL = "http://147.93.9.44:8002";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("@Umanizzare:token");
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

type Tarefa = {
  id: number;
  titulo: string;
  descricao: string;
  createdAt?: string;
};

type Resposta = {
  id: number;
  resposta?: string;
  texto?: string;
  paciente?: { name?: string; nome?: string; email?: string };
  createdAt?: string;
};

function formatarData(data: string) {
  if (!data) return "—";
  try { return new Date(data).toLocaleDateString("pt-BR"); } catch { return data; }
}

export function TasksManagement() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [search, setSearch] = useState("");

  // Modal criar/editar
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Tarefa | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erroModal, setErroModal] = useState("");

  // Respostas
  const [respostasAbertas, setRespostasAbertas] = useState<Record<number, boolean>>({});
  const [respostas, setRespostas] = useState<Record<number, Resposta[]>>({});
  const [loadingRespostas, setLoadingRespostas] = useState<Record<number, boolean>>({});

  useEffect(() => { carregarTarefas(); }, []);

  async function carregarTarefas() {
    try {
      setLoading(true); setErro("");
      const resp = await fetch(`${BASE_URL}/tarefas`, { headers: getAuthHeaders() });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || "Erro ao carregar tarefas.");
      setTarefas(Array.isArray(data) ? data : data.tarefas || data.data || []);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao carregar tarefas.");
    } finally { setLoading(false); }
  }

  async function handleSalvar() {
    if (!titulo.trim()) { setErroModal("Preencha o título."); return; }
    try {
      setSalvando(true); setErroModal("");
      if (editando) {
        // Editar
        const resp = await fetch(`${BASE_URL}/tarefas/${editando.id}`, {
          method: "PATCH", headers: getAuthHeaders(),
          body: JSON.stringify({ titulo, descricao }),
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.message || "Erro ao editar.");
        setTarefas(prev => prev.map(t => t.id === editando.id ? { ...t, titulo, descricao } : t));
      } else {
        // Criar
        const resp = await fetch(`${BASE_URL}/tarefas`, {
          method: "POST", headers: getAuthHeaders(),
          body: JSON.stringify({ titulo, descricao }),
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.message || "Erro ao criar.");
        setTarefas(prev => [...prev, data]);
      }
      fecharModal();
    } catch (err) {
      setErroModal(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally { setSalvando(false); }
  }

  async function handleDeletar(id: number) {
    if (!confirm("Excluir esta tarefa?")) return;
    try {
      const resp = await fetch(`${BASE_URL}/tarefas/${id}`, {
        method: "DELETE", headers: getAuthHeaders(),
      });
      if (!resp.ok) { const d = await resp.json(); throw new Error(d.message || "Erro ao deletar."); }
      setTarefas(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao deletar.");
    }
  }

  async function toggleRespostas(tarefaId: number) {
    const aberto = respostasAbertas[tarefaId];
    setRespostasAbertas(prev => ({ ...prev, [tarefaId]: !aberto }));
    if (!aberto && !respostas[tarefaId]) {
      try {
        setLoadingRespostas(prev => ({ ...prev, [tarefaId]: true }));
        const resp = await fetch(`${BASE_URL}/tarefas/${tarefaId}/respostas`, { headers: getAuthHeaders() });
        const data = await resp.json();
        setRespostas(prev => ({ ...prev, [tarefaId]: Array.isArray(data) ? data : data.respostas || [] }));
      } catch {
        setRespostas(prev => ({ ...prev, [tarefaId]: [] }));
      } finally {
        setLoadingRespostas(prev => ({ ...prev, [tarefaId]: false }));
      }
    }
  }

  function abrirCriar() {
    setEditando(null); setTitulo(""); setDescricao(""); setErroModal(""); setModalAberto(true);
  }

  function abrirEditar(t: Tarefa) {
    setEditando(t); setTitulo(t.titulo); setDescricao(t.descricao); setErroModal(""); setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false); setEditando(null); setTitulo(""); setDescricao(""); setErroModal("");
  }

  const filtradas = tarefas.filter(t =>
    t.titulo.toLowerCase().includes(search.toLowerCase()) ||
    t.descricao?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>

      {/* HEADER */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Gerenciamento de Tarefas</h1>
          <p className={styles.subtitle}>Crie, edite e acompanhe as tarefas atribuídas às pacientes.</p>
        </div>
        <button className={styles.btnNova} onClick={abrirCriar}>
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: 8 }} />Nova tarefa
        </button>
      </div>

      {/* STATS */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#fdecea" }}>
            <FontAwesomeIcon icon={faClipboardList} style={{ color: "#800020" }} />
          </div>
          <div><p className={styles.statLabel}>Total de tarefas</p><h3 className={styles.statNumber}>{loading ? "..." : tarefas.length}</h3></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#e8f5e9" }}>
            <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#2e7d32" }} />
          </div>
          <div><p className={styles.statLabel}>Com respostas</p><h3 className={styles.statNumber}>{loading ? "..." : Object.values(respostas).filter(r => r.length > 0).length}</h3></div>
        </div>
      </div>

      {/* BUSCA */}
      <div className={styles.searchWrapper}>
        <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Buscar tarefa por título ou descrição..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* ESTADOS */}
      {loading && (
        <div className={styles.loadingBlock}>
          <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 10 }} />Carregando tarefas...
        </div>
      )}
      {erro && (
        <div className={styles.erroBlock}>
          {erro} <button onClick={carregarTarefas} className={styles.retryBtn}>Tentar novamente</button>
        </div>
      )}

      {/* LISTA */}
      {!loading && !erro && (
        <div className={styles.tarefaList}>
          {filtradas.length === 0 && (
            <div className={styles.emptyState}>
              <FontAwesomeIcon icon={faClipboardList} className={styles.emptyIcon} />
              <p>Nenhuma tarefa encontrada.</p>
              <button className={styles.btnNova} onClick={abrirCriar}>
                <FontAwesomeIcon icon={faPlus} style={{ marginRight: 8 }} />Criar primeira tarefa
              </button>
            </div>
          )}

          {filtradas.map(t => (
            <div key={t.id} className={styles.tarefaCard}>
              <div className={styles.tarefaCardHeader}>
                <div className={styles.tarefaIconBox}>
                  <FontAwesomeIcon icon={faClipboardList} />
                </div>
                <div className={styles.tarefaInfo}>
                  <p className={styles.tarefaTitulo}>{t.titulo}</p>
                  <p className={styles.tarefaDesc}>{t.descricao}</p>
                  {t.createdAt && <p className={styles.tarefaData}>Criada em {formatarData(t.createdAt)}</p>}
                </div>
                <div className={styles.tarefaAcoes}>
                  <button
                    className={styles.btnRespostas}
                    onClick={() => toggleRespostas(t.id)}
                    title="Ver respostas"
                  >
                    <FontAwesomeIcon icon={faEye} style={{ marginRight: 6 }} />
                    Respostas
                    <FontAwesomeIcon icon={respostasAbertas[t.id] ? faChevronUp : faChevronDown} style={{ marginLeft: 6 }} />
                  </button>
                  <button className={styles.actionBtn} title="Editar" onClick={() => abrirEditar(t)}>
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                  <button className={`${styles.actionBtn} ${styles.actionBtnDelete}`} title="Excluir" onClick={() => handleDeletar(t.id)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>

              {/* RESPOSTAS */}
              {respostasAbertas[t.id] && (
                <div className={styles.respostasBox}>
                  {loadingRespostas[t.id] ? (
                    <div className={styles.loadingBlock}><FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 8 }} />Carregando respostas...</div>
                  ) : respostas[t.id]?.length === 0 ? (
                    <p className={styles.semRespostas}>Nenhuma resposta ainda.</p>
                  ) : (
                    respostas[t.id]?.map(r => (
                      <div key={r.id} className={styles.respostaItem}>
                        <div className={styles.respostaAvatar}>
                          {(r.paciente?.name || r.paciente?.nome || "P")[0].toUpperCase()}
                        </div>
                        <div className={styles.respostaInfo}>
                          <p className={styles.respostaPaciente}>{r.paciente?.name || r.paciente?.nome || r.paciente?.email || "Paciente"}</p>
                          <p className={styles.respostaTexto}>{r.resposta || r.texto || "—"}</p>
                          {r.createdAt && <p className={styles.respostaData}>{formatarData(r.createdAt)}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL CRIAR/EDITAR */}
      {modalAberto && (
        <div className={styles.modalOverlay} onClick={fecharModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editando ? "Editar Tarefa" : "Nova Tarefa"}</h3>
              <button onClick={fecharModal} className={styles.modalClose}><FontAwesomeIcon icon={faXmark} /></button>
            </div>
            <div className={styles.modalBody}>
              {erroModal && <div className={styles.erroInline}>{erroModal}</div>}
              <div className={styles.formField}>
                <label className={styles.formLabel}>Título *</label>
                <input
                  type="text"
                  placeholder="Ex: Diário de emoções"
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  className={styles.formInput}
                  autoFocus
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Descrição</label>
                <textarea
                  rows={4}
                  placeholder="Descreva a tarefa para a paciente..."
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  className={styles.formInput}
                  style={{ resize: "vertical" }}
                />
              </div>
              <div className={styles.modalFooter}>
                <button onClick={fecharModal} className={styles.btnCancel}>Cancelar</button>
                <button onClick={handleSalvar} disabled={salvando} className={styles.btnSave}>
                  {salvando
                    ? <><FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 6 }} />Salvando...</>
                    : editando ? "Salvar alterações" : "Criar tarefa"
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}