import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck, faClipboardList, faUsers, faCheckCircle,
  faClock, faSpinner, faCalendarXmark, faUserTie, faShieldAlt,
  faCalendar, faFileAlt, faShieldHalved, faDownload, faEye,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { apiService } from "../../services/api";
import { PatientHeader, type Aba } from "../../components/PatientHeader";
import styles from "./styles.module.css";

type Consulta = {
  id: number; data: string; horario: string; status?: string;
  psicologo?: { name?: string; nome?: string; email?: string };
};
type Tarefa = { id: number; titulo: string; descricao: string; respondida?: boolean; };
type Workshop = { id: number; titulo: string; descricao?: string; data: string; horario: string; inscrito?: boolean; };
type Arquivo = { id: number; nome?: string; filename?: string; url?: string; createdAt?: string; };
type Opcao = { id: number; text: string; };
type Pergunta = { id: number; number: number; text: string; multiSelect: boolean; options: Opcao[]; };
type Questionario = { id: number; title: string; questions: Pergunta[]; };

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const QUESTIONARIO_AVALIACAO_ID = 1;

function formatarData(data: string) {
  if (!data) return "—";
  try { return new Date(data).toLocaleDateString("pt-BR"); } catch { return data; }
}

function StatusBadge({ status }: { status?: string }) {
  if (status === "confirmada") return <span className={styles.badgeGreen}>Confirmada</span>;
  if (status === "realizada")  return <span className={styles.badgeGreen}>Realizada</span>;
  if (status === "cancelada")  return <span className={styles.badgeRed}>Cancelada</span>;
  return <span className={styles.badgeAmber}>Pendente</span>;
}

export function PatientDashboard() {
  const userName = localStorage.getItem("@Umanizzare:name") || "Usuária";
  const userId   = localStorage.getItem("@Umanizzare:id") || "";
  const primeiroNome = userName.split(" ")[0];

  const [aba, setAba] = useState<Aba>("inicio");

  // dados
  const [consultas,  setConsultas]  = useState<Consulta[]>([]);
  const [tarefas,    setTarefas]    = useState<Tarefa[]>([]);
  const [workshops,  setWorkshops]  = useState<Workshop[]>([]);
  const [arquivos,   setArquivos]   = useState<Arquivo[]>([]);
  const [questionario, setQuestionario] = useState<Questionario | null>(null);
  const [jaRespondeu,  setJaRespondeu]  = useState(false);

  // loadings
  const [loadingConsultas,    setLoadingConsultas]    = useState(true);
  const [loadingTarefas,      setLoadingTarefas]      = useState(true);
  const [loadingWorkshops,    setLoadingWorkshops]    = useState(true);
  const [loadingArquivos,     setLoadingArquivos]     = useState(false);
  const [loadingQuestionario, setLoadingQuestionario] = useState(false);
  const [enviandoRespostas,   setEnviandoRespostas]   = useState(false);

  // erros
  const [erroConsultas,    setErroConsultas]    = useState("");
  const [erroTarefas,      setErroTarefas]      = useState("");
  const [erroWorkshops,    setErroWorkshops]    = useState("");
  const [erroArquivos,     setErroArquivos]     = useState("");
  const [erroQuestionario, setErroQuestionario] = useState("");

  // interações
  const [respondendoId,  setRespondendoId]  = useState<number | null>(null);
  const [respostaTexto,  setRespostaTexto]  = useState("");
  const [inscrevendoId,  setInscrevendoId]  = useState<number | null>(null);
  const [respostasForm,  setRespostasForm]  = useState<Record<number, number[]>>({});
  const [enviado,        setEnviado]        = useState(false);

  useEffect(() => { carregarConsultas(); carregarTarefas(); carregarWorkshops(); }, []);

  useEffect(() => {
    if (aba === "documentos" && arquivos.length === 0 && !loadingArquivos) carregarArquivos();
    if (aba === "avaliacao"  && !questionario && !loadingQuestionario)     carregarQuestionario();
  }, [aba]);

  async function carregarConsultas() {
    try { setLoadingConsultas(true); setErroConsultas("");
      const data = await (apiService as any).getMinhasConsultas();
      setConsultas(Array.isArray(data) ? data : data.consultas || data.data || []);
    } catch (err) { setErroConsultas(err instanceof Error ? err.message : "Erro."); }
    finally { setLoadingConsultas(false); }
  }

  async function carregarTarefas() {
    try { setLoadingTarefas(true); setErroTarefas("");
      const data = await (apiService as any).getMinhasTarefas();
      setTarefas(Array.isArray(data) ? data : data.tarefas || data.data || []);
    } catch (err) { setErroTarefas(err instanceof Error ? err.message : "Erro."); }
    finally { setLoadingTarefas(false); }
  }

  async function carregarWorkshops() {
    try { setLoadingWorkshops(true); setErroWorkshops("");
      const data = await (apiService as any).getWorkshops();
      setWorkshops(Array.isArray(data) ? data : data.workshops || data.data || []);
    } catch (err) { setErroWorkshops(err instanceof Error ? err.message : "Erro."); }
    finally { setLoadingWorkshops(false); }
  }

  async function carregarArquivos() {
    if (!userId) { setErroArquivos("ID do usuário não encontrado."); return; }
    try { setLoadingArquivos(true); setErroArquivos("");
      const data = await (apiService as any).getArquivosPaciente(userId);
      setArquivos(Array.isArray(data) ? data : data.arquivos || data.data || []);
    } catch (err) { setErroArquivos(err instanceof Error ? err.message : "Erro ao carregar documentos."); }
    finally { setLoadingArquivos(false); }
  }

  async function carregarQuestionario() {
    try { setLoadingQuestionario(true); setErroQuestionario("");
      const [q, respostas] = await Promise.all([
        apiService.getQuestionnaireById(String(QUESTIONARIO_AVALIACAO_ID)),
        apiService.getQuestionnaireById(String(QUESTIONARIO_AVALIACAO_ID)).catch(() => null),
      ]);
      setQuestionario(q);
      // verifica se já respondeu
      try {
        const resp = await fetch(`http://147.93.9.44:8002/questionnaires/${QUESTIONARIO_AVALIACAO_ID}/responses`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("@Umanizzare:token")}` },
        });
        if (resp.ok) { const d = await resp.json(); if (d && (Array.isArray(d) ? d.length > 0 : true)) setJaRespondeu(true); }
      } catch {}
    } catch (err) { setErroQuestionario(err instanceof Error ? err.message : "Erro ao carregar questionário."); }
    finally { setLoadingQuestionario(false); }
  }

  function handleOpcao(perguntaId: number, opcaoId: number, multiSelect: boolean) {
    setRespostasForm(prev => {
      const atual = prev[perguntaId] || [];
      if (multiSelect) {
        return { ...prev, [perguntaId]: atual.includes(opcaoId) ? atual.filter(id => id !== opcaoId) : [...atual, opcaoId] };
      }
      return { ...prev, [perguntaId]: [opcaoId] };
    });
  }

  async function handleEnviarQuestionario() {
    if (!questionario) return;
    const answers = questionario.questions.map(q => ({
      questionId: q.id,
      optionIds: respostasForm[q.id] || [],
    }));
    try {
      setEnviandoRespostas(true);
      await apiService.submitResponses(String(QUESTIONARIO_AVALIACAO_ID), { answers });
      setEnviado(true);
      setJaRespondeu(true);
    } catch (err) { alert(err instanceof Error ? err.message : "Erro ao enviar respostas."); }
    finally { setEnviandoRespostas(false); }
  }

  async function handleResponder(tarefaId: number) {
    if (!respostaTexto.trim()) return;
    try {
      await (apiService as any).responderTarefa(tarefaId, respostaTexto);
      setTarefas(prev => prev.map(t => t.id === tarefaId ? { ...t, respondida: true } : t));
      setRespondendoId(null); setRespostaTexto("");
    } catch (err) { alert(err instanceof Error ? err.message : "Erro."); }
  }

  async function handleInscrever(id: number) {
    try { setInscrevendoId(id); await (apiService as any).inscreverWorkshop(id);
      setWorkshops(prev => prev.map(w => w.id === id ? { ...w, inscrito: true } : w));
    } catch (err) { alert(err instanceof Error ? err.message : "Erro."); }
    finally { setInscrevendoId(null); }
  }

  async function handleCancelar(id: number) {
    try { setInscrevendoId(id); await (apiService as any).cancelarWorkshop(id);
      setWorkshops(prev => prev.map(w => w.id === id ? { ...w, inscrito: false } : w));
    } catch (err) { alert(err instanceof Error ? err.message : "Erro."); }
    finally { setInscrevendoId(null); }
  }

  const proximaConsulta = consultas.filter(c => new Date(c.data) >= new Date()).sort((a,b) => new Date(a.data).getTime() - new Date(b.data).getTime())[0];
  const tarefasPendentes  = tarefas.filter(t => !t.respondida);
  const tarefasConcluidas = tarefas.filter(t => t.respondida);
  const workshopsInscritos = workshops.filter(w => w.inscrito);

  function Loading() {
    return <div className={styles.loadingBlock}><FontAwesomeIcon icon={faSpinner} spin className={styles.loadingIcon} /><span>Carregando...</span></div>;
  }
  function Erro({ msg, onRetry }: { msg: string; onRetry: () => void }) {
    return <div className={styles.erroBlock}><span>{msg}</span><button onClick={onRetry} className={styles.retryBtn}>Tentar novamente</button></div>;
  }

  const todasPerguntas = questionario?.questions ?? [];
  const totalPerguntas = todasPerguntas.length;
  const respondidas    = todasPerguntas.filter(q => (respostasForm[q.id] || []).length > 0).length;
  const progresso      = totalPerguntas > 0 ? Math.round((respondidas / totalPerguntas) * 100) : 0;

  return (
    <div className={styles.layout}>
      <PatientHeader aba={aba} onAbaChange={setAba} />

      <main className={styles.content} style={{ marginLeft: 300 }}>

        {/* ── INÍCIO ── */}
        {aba === "inicio" && (<>
          <div className={styles.welcomeBanner}>
            <h2 className={styles.welcomeTitle}>Olá, {primeiroNome}. Seja bem-vinda ao seu portal. 💛</h2>
            <p className={styles.welcomeSub}>Acompanhe seus atendimentos, oficinas, tarefas e muito mais em um só lugar.</p>
            <span className={styles.welcomeBadge}><FontAwesomeIcon icon={faShieldAlt} /> Suas informações são privadas e seguras</span>
          </div>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}><div className={styles.statIcon} style={{ background: "#fdecea" }}><FontAwesomeIcon icon={faCalendarCheck} style={{ color: "#800020" }} /></div><div><p className={styles.statLabel}>Próximo atendimento</p><h3 className={styles.statNumber}>{loadingConsultas ? "..." : proximaConsulta ? formatarData(proximaConsulta.data) : "—"}</h3>{proximaConsulta && <p className={styles.statSub}>{proximaConsulta.horario}</p>}</div></div>
            <div className={styles.statCard}><div className={styles.statIcon} style={{ background: "#fff8e1" }}><FontAwesomeIcon icon={faUsers} style={{ color: "#b45309" }} /></div><div><p className={styles.statLabel}>Oficinas inscritas</p><h3 className={styles.statNumber}>{loadingWorkshops ? "..." : workshopsInscritos.length}</h3></div></div>
            <div className={styles.statCard}><div className={styles.statIcon} style={{ background: "#fff3e0" }}><FontAwesomeIcon icon={faClipboardList} style={{ color: "#e65100" }} /></div><div><p className={styles.statLabel}>Tarefas pendentes</p><h3 className={styles.statNumber}>{loadingTarefas ? "..." : tarefasPendentes.length}</h3></div></div>
            <div className={styles.statCard}><div className={styles.statIcon} style={{ background: "#e8f5e9" }}><FontAwesomeIcon icon={faCheckCircle} style={{ color: "#2e7d32" }} /></div><div><p className={styles.statLabel}>Tarefas concluídas</p><h3 className={styles.statNumber}>{loadingTarefas ? "..." : tarefasConcluidas.length}</h3></div></div>
          </div>
          <div className={styles.resumoGrid}>
            <div className={styles.resumoCard}>
              <div className={styles.resumoHead}><FontAwesomeIcon icon={faCalendarCheck} className={styles.resumoIcon} /><span>Próximos atendimentos</span></div>
              {loadingConsultas ? <Loading /> : erroConsultas ? <Erro msg={erroConsultas} onRetry={carregarConsultas} /> : consultas.slice(0, 3).map(c => (
                <div key={c.id} className={styles.resumoItem}>
                  <div className={styles.resumoDataBox}><span className={styles.resumoDia}>{formatarData(c.data).split("/")[0]}</span><span className={styles.resumoMes}>{MESES[new Date(c.data).getMonth()]}</span></div>
                  <div><p className={styles.resumoItemTitle}>Psicologia · {c.horario}</p>{c.psicologo && <p className={styles.resumoItemSub}>{c.psicologo.name || c.psicologo.nome}</p>}</div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
              {!loadingConsultas && consultas.length === 0 && <p className={styles.vazio}>Nenhum atendimento agendado.</p>}
              <button className={styles.verMaisBtn} onClick={() => setAba("atendimentos")}>Ver todos →</button>
            </div>
            <div className={styles.resumoCard}>
              <div className={styles.resumoHead}><FontAwesomeIcon icon={faClipboardList} className={styles.resumoIcon} /><span>Tarefas pendentes</span></div>
              {loadingTarefas ? <Loading /> : erroTarefas ? <Erro msg={erroTarefas} onRetry={carregarTarefas} /> : tarefasPendentes.slice(0, 3).map(t => (
                <div key={t.id} className={styles.tarefaItemCompact}><FontAwesomeIcon icon={faCheckCircle} style={{ color: "#ddd", fontSize: "1rem", flexShrink: 0 }} /><div><p className={styles.resumoItemTitle}>{t.titulo}</p><p className={styles.resumoItemSub}>{t.descricao}</p></div></div>
              ))}
              {!loadingTarefas && tarefasPendentes.length === 0 && <p className={styles.vazio}>Nenhuma tarefa pendente. ✓</p>}
              <button className={styles.verMaisBtn} onClick={() => setAba("tarefas")}>Ver todas →</button>
            </div>
          </div>
        </>)}

        {/* ── ATENDIMENTOS ── */}
        {aba === "atendimentos" && (
          <div className={styles.abaSection}>
            <div className={styles.abaCabecalho}><h2 className={styles.abaTitle}><FontAwesomeIcon icon={faCalendarCheck} /> Meus atendimentos</h2><p className={styles.abaSub}>Histórico e próximas consultas</p></div>
            {loadingConsultas && <Loading />}
            {erroConsultas && <Erro msg={erroConsultas} onRetry={carregarConsultas} />}
            {!loadingConsultas && !erroConsultas && consultas.length === 0 && <div className={styles.emptyState}><FontAwesomeIcon icon={faCalendarXmark} className={styles.emptyIcon} /><p>Nenhum atendimento encontrado.</p></div>}
            <div className={styles.atendList}>
              {consultas.map(c => (
                <div key={c.id} className={styles.atendItem}>
                  <div className={styles.atendDataBox}><span className={styles.atendDia}>{formatarData(c.data).split("/")[0]}</span><span className={styles.atendMes}>{MESES[new Date(c.data).getMonth()]}</span></div>
                  <div className={styles.atendInfo}><p className={styles.atendTitulo}>Sessão de Psicologia</p><p className={styles.atendProf}><FontAwesomeIcon icon={faUserTie} style={{ marginRight: 4, color: "#800020" }} />{c.psicologo ? (c.psicologo.name || c.psicologo.nome || c.psicologo.email || "Profissional") : "Profissional"}{" · "}{c.horario}</p></div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── OFICINAS ── */}
        {aba === "oficinas" && (
          <div className={styles.abaSection}>
            <div className={styles.abaCabecalho}><h2 className={styles.abaTitle}><FontAwesomeIcon icon={faUsers} /> Oficinas e atividades</h2><p className={styles.abaSub}>Gerencie suas inscrições</p></div>
            {loadingWorkshops && <Loading />}
            {erroWorkshops && <Erro msg={erroWorkshops} onRetry={carregarWorkshops} />}
            {!loadingWorkshops && !erroWorkshops && workshops.length === 0 && <div className={styles.emptyState}><FontAwesomeIcon icon={faUsers} className={styles.emptyIcon} /><p>Nenhuma oficina disponível.</p></div>}
            <div className={styles.oficinaGrid}>
              {workshops.map(w => (
                <div key={w.id} className={`${styles.oficinaCard} ${w.inscrito ? styles.oficinaCardInscrita : ""}`}>
                  {w.inscrito && <div className={styles.oficinaBadgeInscrita}>✓ Inscrita</div>}
                  <div className={styles.oficinaTopo}><span className={styles.oficinaData}><FontAwesomeIcon icon={faCalendar} style={{ marginRight: 4 }} />{formatarData(w.data)}</span><span className={styles.oficinaHora}><FontAwesomeIcon icon={faClock} style={{ marginRight: 4 }} />{w.horario}</span></div>
                  <h4 className={styles.oficinaTitulo}>{w.titulo}</h4>
                  {w.descricao && <p className={styles.oficinaDesc}>{w.descricao}</p>}
                  <button className={w.inscrito ? styles.btnCancelar : styles.btnInscrever} onClick={() => w.inscrito ? handleCancelar(w.id) : handleInscrever(w.id)} disabled={inscrevendoId === w.id}>
                    {inscrevendoId === w.id ? <FontAwesomeIcon icon={faSpinner} spin /> : w.inscrito ? "Cancelar inscrição" : "Inscrever-se"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAREFAS ── */}
        {aba === "tarefas" && (
          <div className={styles.abaSection}>
            <div className={styles.abaCabecalho}><h2 className={styles.abaTitle}><FontAwesomeIcon icon={faClipboardList} /> Minhas tarefas</h2><p className={styles.abaSub}>{tarefasPendentes.length} pendente{tarefasPendentes.length !== 1 ? "s" : ""} · {tarefasConcluidas.length} concluída{tarefasConcluidas.length !== 1 ? "s" : ""}</p></div>
            {loadingTarefas && <Loading />}
            {erroTarefas && <Erro msg={erroTarefas} onRetry={carregarTarefas} />}
            {!loadingTarefas && !erroTarefas && tarefas.length === 0 && <div className={styles.emptyState}><FontAwesomeIcon icon={faCheckCircle} className={styles.emptyIcon} /><p>Nenhuma tarefa atribuída.</p></div>}
            <div className={styles.tarefaList}>
              {tarefas.map(t => (
                <div key={t.id} className={`${styles.tarefaItem} ${t.respondida ? styles.tarefaFeita : ""}`}>
                  <FontAwesomeIcon icon={faCheckCircle} className={styles.tarefaCheck} style={{ color: t.respondida ? "#2e7d32" : "#ddd" }} />
                  <div className={styles.tarefaInfo}>
                    <p className={styles.tarefaTitulo}>{t.titulo}</p>
                    <p className={styles.tarefaDesc}>{t.descricao}</p>
                    {!t.respondida && respondendoId === t.id ? (
                      <div className={styles.respostaBox}>
                        <textarea rows={3} placeholder="Escreva sua resposta..." value={respostaTexto} onChange={e => setRespostaTexto(e.target.value)} className={styles.respostaInput} />
                        <div className={styles.respostaBtns}>
                          <button className={styles.btnEnviar} onClick={() => handleResponder(t.id)}>Enviar resposta</button>
                          <button className={styles.btnCancelarResp} onClick={() => { setRespondendoId(null); setRespostaTexto(""); }}>Cancelar</button>
                        </div>
                      </div>
                    ) : !t.respondida ? (
                      <button className={styles.btnResponder} onClick={() => setRespondendoId(t.id)}>Responder tarefa →</button>
                    ) : (
                      <span className={styles.tarefaRespondida}>✓ Respondida</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CALENDÁRIO ── */}
        {aba === "calendario" && (
          <div className={styles.abaSection}>
            <div className={styles.abaCabecalho}><h2 className={styles.abaTitle}><FontAwesomeIcon icon={faCalendar} /> Calendário</h2><p className={styles.abaSub}>Próximas atividades, consultas e oficinas</p></div>
            <div className={styles.calGrid}>
              <div className={styles.calCard}>
                <h3 className={styles.calMes}>Atendimentos</h3>
                {loadingConsultas ? <Loading /> : consultas.filter(c => new Date(c.data) >= new Date()).slice(0, 5).map(c => (
                  <div key={c.id} className={styles.calItem}><div className={styles.calDot} style={{ background: "#800020" }} /><div><p className={styles.calItemTitle}>Sessão de Psicologia</p><p className={styles.calItemSub}>{formatarData(c.data)} · {c.horario}</p></div></div>
                ))}
                {!loadingConsultas && consultas.filter(c => new Date(c.data) >= new Date()).length === 0 && <p className={styles.vazio}>Nenhum atendimento futuro.</p>}
              </div>
              <div className={styles.calCard}>
                <h3 className={styles.calMes}>Oficinas</h3>
                {loadingWorkshops ? <Loading /> : workshops.filter(w => new Date(w.data) >= new Date()).slice(0, 5).map(w => (
                  <div key={w.id} className={styles.calItem}><div className={styles.calDot} style={{ background: "#E09A3E" }} /><div><p className={styles.calItemTitle}>{w.titulo}</p><p className={styles.calItemSub}>{formatarData(w.data)} · {w.horario}</p></div></div>
                ))}
                {!loadingWorkshops && workshops.filter(w => new Date(w.data) >= new Date()).length === 0 && <p className={styles.vazio}>Nenhuma oficina futura.</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── DOCUMENTOS ── */}
        {aba === "documentos" && (
          <div className={styles.abaSection}>
            <div className={styles.abaCabecalho}><h2 className={styles.abaTitle}><FontAwesomeIcon icon={faFileAlt} /> Meus documentos</h2><p className={styles.abaSub}>Documentos e arquivos do seu prontuário</p></div>
            {loadingArquivos && <Loading />}
            {erroArquivos && <Erro msg={erroArquivos} onRetry={carregarArquivos} />}
            {!loadingArquivos && !erroArquivos && arquivos.length === 0 && (
              <div className={styles.emptyState}><FontAwesomeIcon icon={faFileAlt} className={styles.emptyIcon} /><p>Nenhum documento disponível no momento.</p></div>
            )}
            <div className={styles.docList}>
              {arquivos.map(a => (
                <div key={a.id} className={styles.docItem}>
                  <div className={styles.docIconBox}><FontAwesomeIcon icon={faFileAlt} /></div>
                  <div className={styles.docInfo}>
                    <p className={styles.docNome}>{a.nome || a.filename || `Documento ${a.id}`}</p>
                    {a.createdAt && <p className={styles.docData}>Adicionado em {formatarData(a.createdAt)}</p>}
                  </div>
                  <div className={styles.docAcoes}>
                    {a.url && <>
                      <a href={a.url} target="_blank" rel="noreferrer" className={styles.btnDoc}><FontAwesomeIcon icon={faEye} /> Visualizar</a>
                      <a href={a.url} download className={styles.btnDocOutline}><FontAwesomeIcon icon={faDownload} /></a>
                    </>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── AVALIAÇÃO DE RISCO ── */}
        {aba === "avaliacao" && (
          <div className={styles.abaSection}>
            <div className={styles.abaCabecalho}>
              <h2 className={styles.abaTitle}><FontAwesomeIcon icon={faShieldHalved} /> Avaliação de Risco</h2>
              <p className={styles.abaSub}>Questionário de avaliação — responda com sinceridade</p>
            </div>

            {loadingQuestionario && <Loading />}
            {erroQuestionario && <Erro msg={erroQuestionario} onRetry={carregarQuestionario} />}

            {/* JÁ RESPONDEU */}
            {!loadingQuestionario && !erroQuestionario && (jaRespondeu || enviado) && (
              <div className={styles.avaliacaoSucesso}>
                <FontAwesomeIcon icon={faCheckCircle} className={styles.avaliacaoSucessoIcon} />
                <h3>Avaliação já realizada</h3>
                <p>Suas respostas foram registradas com sucesso. A equipe do Instituto Umanizzare irá analisar e entrar em contato se necessário.</p>
              </div>
            )}

            {/* FORMULÁRIO */}
            {!loadingQuestionario && !erroQuestionario && questionario && !jaRespondeu && !enviado && (
              <>
                <div className={styles.avaliacaoHeader}>
                  <h3 className={styles.avaliacaoTitulo}>{questionario.title}</h3>
                  <div className={styles.progressoWrapper}>
                    <div className={styles.progressoBar}>
                      <div className={styles.progressoFill} style={{ width: `${progresso}%` }} />
                    </div>
                    <span className={styles.progressoTexto}>{respondidas}/{totalPerguntas} respondidas</span>
                  </div>
                </div>

                <div className={styles.perguntaList}>
                  {questionario.questions.sort((a,b) => a.number - b.number).map((q, idx) => (
                    <div key={q.id} className={styles.perguntaCard}>
                      <p className={styles.perguntaNumero}>Pergunta {idx + 1}</p>
                      <p className={styles.perguntaTexto}>{q.text}</p>
                      {q.multiSelect && <p className={styles.perguntaMulti}><FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: 4 }} />Pode selecionar mais de uma opção</p>}
                      <div className={styles.opcoesList}>
                        {q.options.map(o => {
                          const selecionada = (respostasForm[q.id] || []).includes(o.id);
                          return (
                            <button
                              key={o.id}
                              className={`${styles.opcaoBtn} ${selecionada ? styles.opcaoBtnSelecionada : ""}`}
                              onClick={() => handleOpcao(q.id, o.id, q.multiSelect)}
                            >
                              <span className={styles.opcaoCircle}>{selecionada && "✓"}</span>
                              {o.text}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.avaliacaoFooter}>
                  <p className={styles.avaliacaoAviso}><FontAwesomeIcon icon={faShieldAlt} style={{ marginRight: 6 }} />Suas respostas são confidenciais e protegidas.</p>
                  <button
                    className={styles.btnEnviarAvaliacao}
                    onClick={handleEnviarQuestionario}
                    disabled={enviandoRespostas || respondidas === 0}
                  >
                    {enviandoRespostas ? <><FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 8 }} />Enviando...</> : "Enviar avaliação"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

      </main>
    </div>
  );
}