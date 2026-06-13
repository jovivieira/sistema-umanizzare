import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faSave,
  faSpinner,
  faArrowLeft,
  faCheckSquare,
  faDotCircle,
  faClipboardList,
  faPen,
  faMagnifyingGlass,
  faXmark,
  faLayerGroup,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";

interface OptionInput {
  id: number;
  text: string;
}

interface QuestionInput {
  id: number;
  number: number;
  text: string;
  multiSelect: boolean;
  options: OptionInput[];
}

interface QuestionnaireItem {
  id: number;
  title: string;
  questions?: QuestionInput[];
  questionsCount?: number;
}

export function QuestionnaireManagement() {
  const navigate = useNavigate();

  // Bloqueio de segurança client-side para Admin
  const userLoggedRole = localStorage.getItem("@Umanizzare:role") || "USER";
  const isAdm = userLoggedRole === "ADMIN";
  const loggedName = localStorage.getItem("@Umanizzare:name") || "Administrador";

  // --- ESTADOS DA LISTAGEM ---
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingList, setLoadingList] = useState(true);

  // --- ESTADOS DE ALTERNÂNCIA DE TELA ---
  const [isFormActive, setIsFormActive] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- ESTADOS DO FORMULÁRIO (CRIAR/EDITAR) ---
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionInput[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Carregar lista de questionários cadastrados
  async function loadQuestionnaires() {
    try {
      setLoadingList(true);
      const data = await apiService.getQuestionnaires();
      setQuestionnaires(Array.isArray(data) ? data : data.questionnaires || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar questionários.");
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    if (isAdm) {
      loadQuestionnaires();
    }
  }, [isAdm]);

  // Se não for admin, barra o render e redireciona
  if (!isAdm) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger fs-5">Acesso negado. Esta página é restrita a administradores.</div>
        <button className="btn btn-primary" onClick={() => navigate("/")}>Voltar para a Home</button>
      </div>
    );
  }

  // --- FLUXOS DE TRANSIÇÃO DE TELAS ---
  const handleOpenCreate = () => {
    setError("");
    setSuccess("");
    setTitle("");
    setQuestions([]);
    setEditingId(null);
    setIsFormActive(true);
  };

  const handleOpenEdit = async (item: QuestionnaireItem) => {
    setError("");
    setSuccess("");
    setEditingId(item.id.toString());
    setTitle(item.title);
    
    // Se a listagem inicial não trouxer as perguntas internas completas, buscamos por ID individual
    try {
      setSubmitting(true);
      const fullData = await apiService.getQuestionnaireById(item.id.toString());
      setQuestions(fullData.questions || []);
      setIsFormActive(true);
    } catch (err) {
      setError("Erro ao carregar detalhes do questionário.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormActive(false);
    setEditingId(null);
    setTitle("");
    setQuestions([]);
    setError("");
    setSuccess("");
    loadQuestionnaires(); // Recarrega a tabela principal atualizada
  };

  // --- GERENCIADOR DE EXCLUSÃO ---
  const handleDeleteQuestionnaire = async (id: number, itemTitle: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir permanentemente o questionário "${itemTitle}"?`)) return;
    try {
      setError("");
      setSuccess("");
      await (apiService as any).deleteQuestionnaire(id.toString());
      setSuccess("Questionário removido com sucesso!");
      setQuestionnaires(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir o questionário.");
    }
  };

  // --- GERENCIADORES DE QUESTÕES DINÂMICAS ---
  const addQuestion = () => {
    const nextNumber = questions.length + 1;
    setQuestions([
      ...questions,
      { id: 0, number: nextNumber, text: "", multiSelect: false, options: [] }
    ]);
  };

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index).map((q, idx) => ({
      ...q,
      number: idx + 1
    }));
    setQuestions(updated);
  };

  const updateQuestionField = (index: number, field: keyof QuestionInput, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const addOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push({ id: 0, text: "" });
    setQuestions(updated);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== oIndex);
    setQuestions(updated);
  };

  const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex].text = text;
    setQuestions(updated);
  };

  // --- ENVIO DO FORMULÁRIO ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("O título do questionário é obrigatório.");
      return;
    }

    if (questions.length === 0) {
      setError("Adicione pelo menos 1 pergunta ao questionário.");
      return;
    }

    for (const q of questions) {
      if (!q.text.trim()) {
        setError(`A pergunta número ${q.number} está com o enunciado vazio.`);
        return;
      }
      if (q.options.length < 2) {
        setError(`A pergunta número ${q.number} precisa de no mínimo 2 opções de resposta.`);
        return;
      }
      for (const opt of q.options) {
        if (!opt.text.trim()) {
          setError(`Uma das opções da pergunta ${q.number} está vazia.`);
          return;
        }
      }
    }

    setSubmitting(true);

    // ✨ CORREÇÃO AQUI: Remove propriedades de ID cujo valor seja menor ou igual a 0
    const payload = {
      title: title.trim(),
      questions: questions.map((q) => {
        const questionData: any = {
          number: q.number,
          text: q.text.trim(),
          multiSelect: q.multiSelect,
          options: q.options.map((o) => {
            const optionData: any = {
              text: o.text.trim()
            };
            if (o.id && o.id > 0) {
              optionData.id = o.id;
            }
            return optionData;
          })
        };

        if (q.id && q.id > 0) {
          questionData.id = q.id;
        }

        return questionData;
      })
    };

    try {
      if (editingId) {
        await apiService.updateQuestionnaire(editingId, payload);
        setSuccess("Questionário atualizado com sucesso!");
      } else {
        await apiService.createQuestionnaire(payload);
        setSuccess("Questionário criado com sucesso!");
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        handleCloseForm();
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar o questionário.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtragem de busca
  const filteredQuestionnaires = questionnaires.filter(q =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cálculo de Estatísticas básicas
  const totalQuestionnaires = questionnaires.length;
  const totalQuestionsSum = questionnaires.reduce((acc, q) => acc + (q.questionsCount ?? q.questions?.length ?? 0), 0);

  if (loadingList && !isFormActive) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
        <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-primary mb-2" />
        <p className="text-muted">Carregando painel de gerenciamento...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4" style={{ maxWidth: "1200px" }}>
      
      {/* 1. SEÇÃO DA LISTAGEM PRINCIPAL */}
      {!isFormActive ? (
        <>
          {/* TOPBAR */}
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
              <h1 className="h3 fw-bold mb-1" style={{ color: "#800020" }}>Gerenciamento de Questionários</h1>
              <p className="text-muted mb-0">Crie, visualize, edite e remova os questionários de avaliação de risco.</p>
            </div>
            <button className="btn text-white px-4 py-2 shadow-sm d-flex align-items-center gap-2" style={{ backgroundColor: "#800020" }} onClick={handleOpenCreate}>
              <FontAwesomeIcon icon={faPlus} />
              Novo Questionário
            </button>
          </div>

          {error && <div className="alert alert-danger shadow-sm mb-4">{error}</div>}
          {success && <div className="alert alert-success shadow-sm mb-4">{success}</div>}

          {/* MATRIZ DE CARDS DE ESTATÍSTICAS */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm p-3 d-flex flex-row align-items-center gap-3" style={{ backgroundColor: "#fff" }}>
                <div className="rounded p-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#fdecea", width: "55px", height: "55px" }}>
                  <FontAwesomeIcon icon={faClipboardList} style={{ color: "#800020", fontSize: "1.4rem" }} />
                </div>
                <div>
                  <p className="text-muted small mb-0 fw-semibold text-uppercase">Total de Modelos</p>
                  <h3 className="fw-bold mb-0">{totalQuestionnaires}</h3>
                  <small className="text-muted">Questionários ativos</small>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm p-3 d-flex flex-row align-items-center gap-3" style={{ backgroundColor: "#fff" }}>
                <div className="rounded p-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#e8f5e9", width: "55px", height: "55px" }}>
                  <FontAwesomeIcon icon={faQuestionCircle} style={{ color: "#2e7d32", fontSize: "1.4rem" }} />
                </div>
                <div>
                  <p className="text-muted small mb-0 fw-semibold text-uppercase">Total de Perguntas</p>
                  <h3 className="fw-bold mb-0">{totalQuestionsSum}</h3>
                  <small className="text-muted">Perguntas estruturadas</small>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm p-3 d-flex flex-row align-items-center gap-3" style={{ backgroundColor: "#fff" }}>
                <div className="rounded p-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#f3e5f5", width: "55px", height: "55px" }}>
                  <FontAwesomeIcon icon={faLayerGroup} style={{ color: "#6a1b9a", fontSize: "1.4rem" }} />
                </div>
                <div>
                  <p className="text-muted small mb-0 fw-semibold text-uppercase">Média por Formulário</p>
                  <h3 className="fw-bold mb-0">{totalQuestionnaires > 0 ? Math.round(totalQuestionsSum / totalQuestionnaires) : 0}</h3>
                  <small className="text-muted">Perguntas por bloco</small>
                </div>
              </div>
            </div>
          </div>

          {/* BUSCA / FILTRO */}
          <div className="card border-0 shadow-sm p-3 mb-4">
            <div className="input-group" style={{ maxWidth: "450px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Buscar questionário por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="btn btn-outline-secondary border-start-0" onClick={() => setSearchTerm("")}>
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              )}
            </div>
          </div>

          {/* TABELA DE REGISTROS */}
          <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="text-white" style={{ backgroundColor: "#800020" }}>
                  <tr>
                    <th className="p-3" style={{ width: "100px" }}>ID</th>
                    <th className="p-3">Título do Questionário</th>
                    <th className="p-3 text-center" style={{ width: "180px" }}>Qtd. de Perguntas</th>
                    <th className="p-3 text-end" style={{ width: "220px" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestionnaires.length > 0 ? (
                    filteredQuestionnaires.map((q) => (
                      <tr key={q.id}>
                        <td className="p-3 fw-bold text-muted">#{q.id}</td>
                        <td className="p-3 fw-semibold text-dark">{q.title}</td>
                        <td className="p-3 text-center">
                          <span className="badge bg-light text-dark px-3 py-2 rounded-pill border fs-6">
                            {q.questionsCount ?? q.questions?.length ?? 0} itens
                          </span>
                        </td>
                        <td className="p-3 text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <button className="btn btn-sm btn-outline-primary px-3" title="Editar Questionário" onClick={() => handleOpenEdit(q)}>
                              <FontAwesomeIcon icon={faPen} className="me-1" /> Editar
                            </button>
                            <button className="btn btn-sm btn-outline-danger px-3" title="Excluir Questionário" onClick={() => handleDeleteQuestionnaire(q.id, q.title)}>
                              <FontAwesomeIcon icon={faTrash} className="me-1" /> Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-5 text-muted">
                        <FontAwesomeIcon icon={faClipboardList} size="2x" className="mb-2 opacity-50" />
                        <p className="mb-0 fs-5">Nenhum questionário encontrado.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        
        // 2. SEÇÃO DO FORMULÁRIO DE CADASTRO/EDIÇÃO
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          
          {/* Botão Voltar para fechar o formulário */}
          <button className="btn btn-light mb-3 text-muted d-flex align-items-center gap-2 border shadow-sm" onClick={handleCloseForm}>
            <FontAwesomeIcon icon={faArrowLeft} /> Voltar para a Lista
          </button>

          <div className="card shadow border-0 mb-4">
            <div className="card-header text-white p-4" style={{ backgroundColor: "#800020", borderRadius: "12px 12px 0 0" }}>
              <h2 className="h4 mb-1 fw-bold">{editingId ? "Editar Questionário" : "Criar Novo Questionário"}</h2>
              <p className="mb-0 opacity-75 small">Monte as perguntas, defina se permitem múltipla escolha e adicione as opções de resposta.</p>
            </div>

            <div className="card-body p-4">
              {error && <div className="alert alert-danger shadow-sm mb-4">{error}</div>}
              {success && <div className="alert alert-success shadow-sm mb-4">{success}</div>}

              <form onSubmit={handleSubmit}>
                {/* TÍTULO DO QUESTIONÁRIO */}
                <div className="mb-4 bg-light p-3 rounded border">
                  <label className="form-label fw-bold text-dark fs-5">Título do Questionário</label>
                  <input
                    type="text"
                    className="form-control form-control-lg border-secondary-subtle"
                    placeholder="Ex: Avaliação de Risco Gestacional Geral"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <hr className="my-4 text-muted" />

                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h3 className="h5 fw-bold mb-0 text-secondary">Perguntas e Opções estruturadas</h3>
                  <button type="button" className="btn text-white btn-sm px-3 d-flex align-items-center gap-2 shadow-sm" style={{ backgroundColor: "#0da170" }} onClick={addQuestion}>
                    <FontAwesomeIcon icon={faPlus} /> Adicionar Pergunta
                  </button>
                </div>

                {/* SEÇÃO DINÂMICA DE PERGUNTAS */}
                {questions.map((question, qIndex) => (
                  <div key={qIndex} className="card border border-secondary-subtle shadow-sm mb-4" style={{ borderRadius: "10px" }}>
                    <div className="card-header bg-light d-flex align-items-center justify-content-between py-3">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge text-white px-2 py-2 fs-6" style={{ backgroundColor: "#b92e57" }}>
                          Q{question.number}
                        </span>
                        <span className="fw-bold text-dark">Configuração da Pergunta</span>
                      </div>
                      <button type="button" className="btn btn-outline-danger btn-sm px-2 py-1" onClick={() => removeQuestion(qIndex)}>
                        <FontAwesomeIcon icon={faTrash} /> Excluir Pergunta
                      </button>
                    </div>

                    <div className="card-body">
                      {/* Enunciado */}
                      <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">Enunciado da Pergunta</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex: Com quantos anos você teve sua primeira gestação?"
                          value={question.text}
                          onChange={(e) => updateQuestionField(qIndex, "text", e.target.value)}
                        />
                      </div>

                      {/* Tipo de Seleção */}
                      <div className="mb-3 form-check form-switch bg-light p-3 rounded border-start border-3 border-warning ps-5">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`multiSelect-${qIndex}`}
                          checked={question.multiSelect}
                          onChange={(e) => updateQuestionField(qIndex, "multiSelect", e.target.checked)}
                          style={{ cursor: "pointer" }}
                        />
                        <label className="form-check-label fw-semibold text-dark" htmlFor={`multiSelect-${qIndex}`} style={{ cursor: "pointer" }}>
                          Permitir Múltipla Escolha (Checkbox)
                        </label>
                        <small className="text-muted d-block mt-1">
                          Se desativado, o paciente responderá usando botões de escolha única (Radio Buttons).
                        </small>
                      </div>

                      {/* Opções de Resposta */}
                      <div className="mt-3 p-3 rounded" style={{ backgroundColor: "#fafafa", border: "1px dashed #ccc" }}>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="small fw-bold text-dark text-uppercase">Opções de Resposta</span>
                          <button type="button" className="btn btn-outline-secondary btn-sm px-2 py-1" style={{ fontSize: "0.85rem" }} onClick={() => addOption(qIndex)}>
                            <FontAwesomeIcon icon={faPlus} /> Adicionar Opção
                          </button>
                        </div>

                        {question.options.length === 0 && (
                          <p className="text-center text-muted small my-3">Nenhuma opção adicionada. Adicione pelo menos duas opções de resposta.</p>
                        )}

                        <div className="d-flex flex-column gap-2">
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="d-flex align-items-center gap-2">
                              <FontAwesomeIcon icon={question.multiSelect ? faCheckSquare : faDotCircle} className="text-muted" />
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder={`Opção ${oIndex + 1}`}
                                value={option.text}
                                onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                              />
                              <button type="button" className="btn btn-link text-danger p-1" onClick={() => removeOption(qIndex, oIndex)}>
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                ))}

                {/* BOTÃO DE SALVAR */}
                <div className="d-flex justify-content-end mt-4 pt-3 border-top gap-2">
                  <button type="button" className="btn btn-lg btn-light border px-4" onClick={handleCloseForm}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-lg text-white px-5 d-flex align-items-center gap-2 shadow-sm" style={{ backgroundColor: "#800020" }}>
                    {submitting ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin /> Salvando...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSave} /> {editingId ? "Salvar Alterações" : "Publicar Questionário"}
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}