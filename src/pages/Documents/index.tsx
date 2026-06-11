import { useState } from "react";
import styles from "./styles.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt, faFilePdf, faFileImage, faFileWord,
  faDownload, faTrash, faUpload, faSearch, faFolder,
} from "@fortawesome/free-solid-svg-icons";

const role = localStorage.getItem("@Umanizzare:role") || "USER";

const mockDocs = [
  { id: "1", nome: "Termo de Consentimento", tipo: "PDF", tamanho: "245 KB", data: "01/06/2026", categoria: "Institucional", icone: faFilePdf, cor: "#fdecea" },
  { id: "2", nome: "Ficha de Acolhimento", tipo: "PDF", tamanho: "312 KB", data: "03/06/2026", categoria: "Pessoal", icone: faFilePdf, cor: "#fdecea" },
  { id: "3", nome: "Cartilha de Direitos", tipo: "PDF", tamanho: "1.2 MB", data: "05/06/2026", categoria: "Institucional", icone: faFilePdf, cor: "#fdecea" },
  { id: "4", nome: "Relatório de Atendimento", tipo: "DOCX", tamanho: "89 KB", data: "07/06/2026", categoria: "Pessoal", icone: faFileWord, cor: "#e3f2fd" },
  { id: "5", nome: "Foto do Documento", tipo: "IMG", tamanho: "2.1 MB", data: "08/06/2026", categoria: "Pessoal", icone: faFileImage, cor: "#e8f5e9" },
];

export function Documents() {
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("Todos");

  const filtered = mockDocs.filter(d =>
    d.nome.toLowerCase().includes(search.toLowerCase()) &&
    (categoria === "Todos" || d.categoria === categoria)
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Documentos</h1>
          <p className={styles.subtitle}>Acesse e gerencie seus documentos.</p>
        </div>
        {(role === "ADMIN" || role === "PSICOLOGO") && (
          <button className={styles.btnUpload}>
            <FontAwesomeIcon icon={faUpload} style={{ marginRight: 8 }} />
            Enviar documento
          </button>
        )}
      </div>

      {/* CATEGORIAS */}
      <div className={styles.categorias}>
        {["Todos", "Institucional", "Pessoal"].map(c => (
          <button
            key={c}
            className={`${styles.catBtn} ${categoria === c ? styles.catBtnActive : ""}`}
            onClick={() => setCategoria(c)}
          >
            <FontAwesomeIcon icon={faFolder} style={{ marginRight: 6 }} />
            {c}
          </button>
        ))}
      </div>

      {/* BUSCA */}
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

      {/* LISTA */}
      <div className={styles.docGrid}>
        {filtered.map(d => (
          <div key={d.id} className={styles.docCard}>
            <div className={styles.docIcon} style={{ background: d.cor }}>
              <FontAwesomeIcon icon={d.icone} style={{ fontSize: "1.8rem", color: "#800020" }} />
            </div>
            <div className={styles.docInfo}>
              <p className={styles.docNome}>{d.nome}</p>
              <p className={styles.docMeta}>{d.tipo} · {d.tamanho} · {d.data}</p>
              <span className={styles.docCategoria}>{d.categoria}</span>
            </div>
            <div className={styles.docActions}>
              <button className={styles.actionBtn} title="Baixar">
                <FontAwesomeIcon icon={faDownload} />
              </button>
              {(role === "ADMIN" || role === "PSICOLOGO") && (
                <button className={`${styles.actionBtn} ${styles.actionBtnDelete}`} title="Excluir">
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={styles.empty}>
          <FontAwesomeIcon icon={faFileAlt} style={{ fontSize: "2.5rem", color: "#ddd", marginBottom: 12 }} />
          <p>Nenhum documento encontrado.</p>
        </div>
      )}
    </div>
  );
}