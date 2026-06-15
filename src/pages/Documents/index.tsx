import { useState, useEffect, useRef } from "react";
import styles from "./styles.module.css";
import { apiService } from "../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt, faFilePdf, faFileImage, faFileWord,
  faDownload, faTrash, faUpload, faSearch, faFolder,
  faSpinner, faUsers, faChevronLeft, faEye,
} from "@fortawesome/free-solid-svg-icons";

const role = localStorage.getItem("@Umanizzare:role") || "USER";
const BASE_URL = "http://147.93.9.44:8002";

type Paciente = {
  id: string;
  name?: string;
  nome?: string;
  email: string;
  role?: string;
};

type Arquivo = {
  id: number;
  nome?: string;
  filename?: string;
  url?: string;
  tipo?: string;
  tamanho?: string;
  createdAt?: string;
};

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("@Umanizzare:token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getNome(p: Paciente) {
  return p.name || p.nome || "Sem nome";
}

function getIniciais(p: Paciente) {
  return getNome(p).split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

function formatarData(data: string) {
  if (!data) return "—";
  try { return new Date(data).toLocaleDateString("pt-BR"); } catch { return data; }
}

function getIconeArquivo(arquivo: Arquivo) {
  const nome = arquivo.nome || arquivo.filename || "";
  const ext = nome.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return { icone: faFilePdf, cor: "#fdecea" };
  if (["jpg","jpeg","png","gif","webp"].includes(ext || "")) return { icone: faFileImage, cor: "#e8f5e9" };
  if (["doc","docx"].includes(ext || "")) return { icone: faFileWord, cor: "#e3f2fd" };
  return { icone: faFileAlt, cor: "#f3e5f5" };
}

export function Documents() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [search, setSearch] = useState("");
  const [searchPaciente, setSearchPaciente] = useState("");
  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [loadingArquivos, setLoadingArquivos] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [erroPacientes, setErroPacientes] = useState("");
  const [erroArquivos, setErroArquivos] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isAdmOuPsi = role === "ADMIN" || role === "PSICOLOGO";

  useEffect(() => {
    carregarPacientes();
  }, []);

  async function carregarPacientes() {
    try {
      setLoadingPacientes(true); setErroPacientes("");
      const data = await apiService.getUsers();
      const lista = Array.isArray(data) ? data : data.users || data.data || [];
      setPacientes(lista.filter((u: Paciente) => u.role !== "ADMIN"));
    } catch (err) {
      setErroPacientes(err instanceof Error ? err.message : "Erro ao carregar pacientes.");
    } finally {
      setLoadingPacientes(false);
    }
  }

  async function carregarArquivos(pacienteId: string) {
    try {
      setLoadingArquivos(true); setErroArquivos("");
      const resp = await fetch(`${BASE_URL}/fichas/${pacienteId}/arquivos`, {
        headers: getAuthHeaders(),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || "Erro ao buscar arquivos.");
      setArquivos(Array.isArray(data) ? data : data.arquivos || data.data || []);
    } catch (err) {
      setErroArquivos(err instanceof Error ? err.message : "Erro ao carregar documentos.");
    } finally {
      setLoadingArquivos(false);
    }
  }

  function selecionarPaciente(p: Paciente) {
    setPacienteSelecionado(p);
    setArquivos([]);
    setSearch("");
    carregarArquivos(p.id);
  }

  function voltarParaLista() {
    setPacienteSelecionado(null);
    setArquivos([]);
    setSearch("");
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!pacienteSelecionado) return;
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const resp = await fetch(`${BASE_URL}/fichas/${pacienteSelecionado.id}/arquivos`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || "Erro ao enviar arquivo.");
      await carregarArquivos(pacienteSelecionado.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao enviar arquivo.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDeletar(arquivoId: number) {
    if (!pacienteSelecionado) return;
    if (!confirm("Excluir este documento?")) return;
    try {
      const resp = await fetch(`${BASE_URL}/fichas/${pacienteSelecionado.id}/arquivos/${arquivoId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.message || "Erro ao excluir.");
      }
      setArquivos(prev => prev.filter(a => a.id !== arquivoId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir documento.");
    }
  }

  const pacientesFiltrados = pacientes.filter(p =>
    getNome(p).toLowerCase().includes(searchPaciente.toLowerCase()) ||
    p.email.toLowerCase().includes(searchPaciente.toLowerCase())
  );

  const arquivosFiltrados = arquivos.filter(a =>
    (a.nome || a.filename || "").toLowerCase().includes(search.toLowerCase())
  );

  // ── LISTA DE PACIENTES ──
  if (!pacienteSelecionado) {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Documentos</h1>
            <p className={styles.subtitle}>Selecione uma paciente para ver seus documentos.</p>
          </div>
        </div>

        <div className={styles.searchWrapper}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar paciente por nome ou e-mail..."
            value={searchPaciente}
            onChange={e => setSearchPaciente(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {loadingPacientes && (
          <div className={styles.loadingBlock}>
            <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 10 }} />
            Carregando pacientes...
          </div>
        )}

        {erroPacientes && (
          <div className={styles.erroBlock}>
            {erroPacientes}
            <button onClick={carregarPacientes} className={styles.retryBtn}>Tentar novamente</button>
          </div>
        )}

        <div className={styles.pacienteGrid}>
          {pacientesFiltrados.map(p => (
            <button
              key={p.id}
              className={styles.pacienteCard}
              onClick={() => selecionarPaciente(p)}
            >
              <div className={styles.pacienteAvatar}>{getIniciais(p)}</div>
              <div className={styles.pacienteInfo}>
                <p className={styles.pacienteNome}>{getNome(p)}</p>
                <p className={styles.pacienteEmail}>{p.email}</p>
              </div>
              <FontAwesomeIcon icon={faFolder} className={styles.pacienteFolderIcon} />
            </button>
          ))}
        </div>

        {!loadingPacientes && pacientesFiltrados.length === 0 && (
          <div className={styles.empty}>
            <FontAwesomeIcon icon={faUsers} style={{ fontSize: "2.5rem", color: "#ddd", marginBottom: 12 }} />
            <p>Nenhuma paciente encontrada.</p>
          </div>
        )}
      </div>
    );
  }

  // ── DOCUMENTOS DA PACIENTE ──
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button className={styles.btnVoltar} onClick={voltarParaLista}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <div className={styles.pacienteAvatarSm}>{getIniciais(pacienteSelecionado)}</div>
          <div>
            <h1 className={styles.title}>{getNome(pacienteSelecionado)}</h1>
            <p className={styles.subtitle}>Documentos e arquivos do prontuário</p>
          </div>
        </div>
        {isAdmOuPsi && (
          <button
            className={styles.btnUpload}
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading
              ? <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 8 }} />
              : <FontAwesomeIcon icon={faUpload} style={{ marginRight: 8 }} />
            }
            {uploading ? "Enviando..." : "Enviar documento"}
          </button>
        )}
        <input ref={inputRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style={{ display: "none" }} onChange={handleUpload} />
      </div>

      <div className={styles.searchWrapper}>
        <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Buscar documento..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {loadingArquivos && (
        <div className={styles.loadingBlock}>
          <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 10 }} />
          Carregando documentos...
        </div>
      )}

      {erroArquivos && (
        <div className={styles.erroBlock}>
          {erroArquivos}
          <button onClick={() => carregarArquivos(pacienteSelecionado.id)} className={styles.retryBtn}>
            Tentar novamente
          </button>
        </div>
      )}

      {!loadingArquivos && !erroArquivos && (
        <div className={styles.docGrid}>
          {arquivosFiltrados.map(a => {
            const { icone, cor } = getIconeArquivo(a);
            return (
              <div key={a.id} className={styles.docCard}>
                <div className={styles.docIcon} style={{ background: cor }}>
                  <FontAwesomeIcon icon={icone} style={{ fontSize: "1.8rem", color: "#800020" }} />
                </div>
                <div className={styles.docInfo}>
                  <p className={styles.docNome}>{a.nome || a.filename || `Documento ${a.id}`}</p>
                  {a.createdAt && <p className={styles.docMeta}>Adicionado em {formatarData(a.createdAt)}</p>}
                </div>
                <div className={styles.docActions}>
                  {a.url && (
                    <>
                      <a href={a.url} target="_blank" rel="noreferrer" className={styles.actionBtn} title="Visualizar">
                        <FontAwesomeIcon icon={faEye} />
                      </a>
                      <a href={a.url} download className={styles.actionBtn} title="Baixar">
                        <FontAwesomeIcon icon={faDownload} />
                      </a>
                    </>
                  )}
                  {isAdmOuPsi && (
                    <button
                      className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                      title="Excluir"
                      onClick={() => handleDeletar(a.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loadingArquivos && !erroArquivos && arquivosFiltrados.length === 0 && (
        <div className={styles.empty}>
          <FontAwesomeIcon icon={faFileAlt} style={{ fontSize: "2.5rem", color: "#ddd", marginBottom: 12 }} />
          <p>Nenhum documento encontrado para esta paciente.</p>
          {isAdmOuPsi && (
            <button className={styles.btnUploadEmpty} onClick={() => inputRef.current?.click()}>
              <FontAwesomeIcon icon={faUpload} style={{ marginRight: 8 }} />
              Enviar primeiro documento
            </button>
          )}
        </div>
      )}
    </div>
  );
}