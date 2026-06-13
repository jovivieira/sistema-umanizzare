import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faCheckCircle,
  faSpinner,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./styles.module.css";

interface Option {
  id: number;
  text: string;
}

interface Question {
  id: number;
  number: number;
  text: string;
  multiSelect: boolean;
  options: Option[];
}

interface QuestionnaireData {
  id: number;
  title: string;
  questions: Question[];
}

// respostas para o POST no backend
interface AnswerPayload {
  questionId: number;
  optionIds: number[];
}

export function TakeQuestionnaire() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Armazenar as respostas
  const [answers, setAnswers] = useState<Record<number, number[]>>({});

  useEffect(() => {
    async function fetchQuestionnaire() {
      try {
        setLoading(true);

        const data = await apiService.getQuestionnaireById(id || "1");
        setQuestionnaire(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar questionário.",
        );
      } finally {
        setLoading(false);
      }
    }
    fetchQuestionnaire();
  }, [id]);

  // gerenciador de radio e checkbox
  function handleSelectOption(
    questionId: number,
    optionId: number,
    isMulti: boolean,
  ) {
    setAnswers((prev) => {
      const currentSelected = prev[questionId] || [];

      if (!isMulti) {
        return { ...prev, [questionId]: [optionId] };
      } else {
        if (currentSelected.includes(optionId)) {
          return {
            ...prev,
            [questionId]: currentSelected.filter((id) => id !== optionId),
          };
        } else {
          return { ...prev, [questionId]: [...currentSelected, optionId] };
        }
      }
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!questionnaire) return;

    // Validar perguntas
    const totalQuestions = questionnaire.questions.length;
    const answeredCount = Object.keys(answers).filter(
      (key) => answers[Number(key)].length > 0,
    ).length;

    if (answeredCount < totalQuestions) {
      if (
        !window.confirm(
          "Você deixou perguntas sem responder. Deseja enviar mesmo assim?",
        )
      ) {
        return;
      }
    }

    setSubmitting(true);
    setError("");

    try {
      // formata o payload do questionario
      const payload: AnswerPayload[] = Object.entries(answers).map(
        ([qId, optIds]) => ({
          questionId: Number(qId),
          optionIds: optIds,
        }),
      );

      // rota do post das respostas
      await apiService.submitResponses(questionnaire.id.toString(), {
        answers: payload,
      });

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        navigate("/");
      }, 3000);

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao enviar respostas.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
        <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-primary mb-2" />
        <p className="text-muted">Carregando formulário de avaliação...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className={`container mt-5 py-5 text-center ${styles.container}`}>
        <div
          className="card shadow-sm border-0 p-5 mx-auto"
          style={{ maxWidth: "600px", backgroundColor: "#fff" }}
        >
          <FontAwesomeIcon
            icon={faCheckCircle}
            size="4x"
            className="text-success mb-3"
          />
          <h2 className="fw-bold mb-3" style={{ color: "#800020" }}>
            Respostas Enviadas
          </h2>
          <p className="text-muted mb-4 fs-5">
            Obrigado por responder. Suas respostas foram computadas com sucesso
            e nossa equipe assistencial irá analisá-las de imediato.
          </p>
          <button
            className="btn btn-lg w-100 text-white"
            style={{ backgroundColor: "#0da170" }}
            onClick={() => navigate("/")}
          >
            Voltar para a Página Inicial
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5" style={{ maxWidth: "850px" }}>
      {/* HEADER DO FORMULÁRIO */}
      <div className="card shadow-sm border-0 mb-4 text-white" style={{ backgroundColor: "#800020", borderRadius: "12px" }}>
        <div className="card-body p-4 d-flex align-items-center">
          <div className="p-3 rounded bg-white bg-opacity-10 me-3">
            <FontAwesomeIcon icon={faFileAlt} size="2x" />
          </div>
          <div>
            <h1 className="h3 fw-bold mb-1">{questionnaire?.title}</h1>
            <p className="mb-0 opacity-75">Por favor, responda com atenção às questões abaixo para que possamos prestar o melhor apoio.</p>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger shadow-sm mb-4">{error}</div>}

      {/* FORMULÁRIO DINÂMICO */}
      <form onSubmit={handleSubmit}>
        {questionnaire?.questions.map((question) => {
          const currentAnswers = answers[question.id] || [];

          return (
            <div key={question.id} className="card shadow-sm border-0 mb-4" style={{ borderRadius: "12px" }}>
              <div className="card-body p-4">
                {/* Enunciado da Pergunta */}
                <h5 className="fw-bold mb-3 d-flex align-items-start" style={{ color: "#272f43", fontSize: "1.15rem", lineHeight: "1.5" }}>
                  <span className="badge me-2 text-white" style={{ backgroundColor: "#b92e57" }}>{question.number}</span>
                  {question.text}
                </h5>

                {/* Sub-alerta discreto indicando múltipla escolha */}
                {question.multiSelect && (
                  <small className="text-muted d-block mb-3 border-start border-warning ps-2 bg-warning bg-opacity-10 py-1">
                    * Você pode selecionar mais de uma opção para esta resposta.
                  </small>
                )}

                {/* Opções */}
                <div className="d-flex flex-column gap-2 mt-2">
                  {question.options.map((option) => {
                    const isChecked = currentAnswers.includes(option.id);
                    const inputId = `q-${question.id}-o-${option.id}`;

                    return (
                      <label 
                        key={option.id} 
                        htmlFor={inputId}
                        className={`form-check p-3 rounded border transition-all ${
                          isChecked ? "border-success bg-success bg-opacity-10" : "border-light bg-light bg-opacity-25"
                        }`}
                        style={{ cursor: "pointer", display: "block", paddingLeft: "2.75rem", transition: "all 0.2s ease" }}
                      >
                        <input
                          className="form-check-input"
                          type={question.multiSelect ? "checkbox" : "radio"}
                          id={inputId}
                          name={`question-${question.id}`}
                          checked={isChecked}
                          onChange={() => handleSelectOption(question.id, option.id, question.multiSelect)}
                          style={{ marginTop: "0.25rem" }}
                        />
                        <span className="form-check-label text-dark" style={{ fontSize: "1rem" }}>
                          {option.text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {/* BOTÃO DE ENVIO */}
        <div className="d-flex justify-content-end mt-4">
          <button 
            type="submit" 
            disabled={submitting} 
            className="btn btn-lg px-5 py-3 text-white shadow-sm border-0 d-flex align-items-center gap-2"
            style={{ backgroundColor: "#0da170", borderRadius: "8px" }}
          >
            {submitting ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                Enviando Avaliação...
              </>
            ) : (
              <>
                Concluir e Enviar Formulário
                <FontAwesomeIcon icon={faArrowRight} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
