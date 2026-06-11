
import { useState } from "react";
import styles from "./styles.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers, faMagnifyingGlass, faEye, faClipboardList,
  faCalendarPlus, faPhone, faMapMarkerAlt, faXmark,
} from "@fortawesome/free-solid-svg-icons";

const mockPacientes = [
  { id: "1", name: "Maria Silva", email: "maria@email.com", telefone: "(61) 99999-0001", idade: 32, endereco: "QS 3 Lote 5, Águas Claras", status: "ativo", ultimaConsulta: "05/06/2026", proximaConsulta: "10/06/2026", cpf: "123.456.789-00", genero: "Feminino", funcao_atual: "Desempregada" },
  { id: "2", name: "Ana Souza", email: "ana@email.com", telefone: "(61) 99999-0002", idade: 27, endereco: "QNM 15 Casa 3, Ceilândia", status: "ativo", ultimaConsulta: "03/06/2026", proximaConsulta: "17/06/2026", cpf: "987.654.321-00", genero: "Feminino", funcao_atual: "Auxiliar de serviços" },
  { id: "3", name: "Carla Mendes", email: "carla@email.com", telefone: "(61) 99999-0003", idade: 45, endereco: "SQS 304 Bloco A, Asa Sul", status: "inativo", ultimaConsulta: "20/05/2026", proximaConsulta: "—", cpf: "111.222.333-44", genero: "Feminino", funcao_atual: "Comerciante" },
  { id: "4", name: "Juliana Costa", email: "juliana@email.com", telefone: "(61) 99999-0004", idade: 38, endereco: "QR 302 Conjunto 3, Samambaia", status: "ativo", ultimaConsulta: "07/06/2026", proximaConsulta: "14/06/2026", cpf: "444.555.666-77", genero: "Feminino", funcao_atual: "Professora" },
];

export function Patients() {
  const [search, setSearch] = useState("");
  const [viewPaciente, setViewPaciente] = useState<typeof mockPacientes[0] | null>(null);

  const filtered = mockPacientes.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Pacientes</h1>
          <p className={styles.subtitle}>Gerencie e acompanhe suas pacientes.</p>
        </div>
      </div>

      {/* STATS */}
      <div className={styles.statsGrid}>
        {[
          { label: "Total de pacientes", value: mockPacientes.length, color: "#fdecea", iconColor: "#800020", icon: faUsers },
          { label: "Pacientes ativas", value: mockPacientes.filter(p => p.status === "ativo").length, color: "#e8f5e9", iconColor: "#2e7d32", icon: faUsers },
          { label: "Consultas esta semana", value: 4, color: "#e3f2fd", iconColor: "#1565c0", icon: faCalendarPlus },
          { label: "Tarefas atribuídas", value: 7, color: "#f3e5f5", iconColor: "#6a1b9a", icon: faClipboardList },
        ].map(s => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: s.color }}>
              <FontAwesomeIcon icon={s.icon} style={{ color: s.iconColor, fontSize: "1.2rem" }} />
            </div>
            <div>
              <p className={styles.statLabel}>{s.label}</p>
              <h3 className={styles.statNumber}>{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* BUSCA */}
      <div className={styles.searchWrapper}>
        <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Buscar paciente por nome ou e-mail..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* TABELA */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Contato</th>
              <th>Idade</th>
              <th>Última Consulta</th>
              <th>Próxima Consulta</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <div className={styles.userInfo}>
                    <div className={styles.avatar}>{p.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}</div>
                    <div>
                      <p className={styles.userName}>{p.name}</p>
                      <p className={styles.userEmail}>{p.email}</p>
                    </div>
                  </div>
                </td>
                <td className={styles.contactCell}>
                  <p><FontAwesomeIcon icon={faPhone} style={{ marginRight: 4, color: "#800020" }} />{p.telefone}</p>
                </td>
                <td>{p.idade} anos</td>
                <td>{p.ultimaConsulta}</td>
                <td>{p.proximaConsulta}</td>
                <td>
                  <span className={p.status === "ativo" ? styles.badgeAtivo : styles.badgeInativo}>
                    {p.status === "ativo" ? "Ativa" : "Inativa"}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.actionBtn} title="Ver prontuário" onClick={() => setViewPaciente(p)}>
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button className={styles.actionBtn} title="Agendar consulta">
                      <FontAwesomeIcon icon={faCalendarPlus} />
                    </button>
                    <button className={styles.actionBtn} title="Atribuir tarefa">
                      <FontAwesomeIcon icon={faClipboardList} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CARDS MOBILE */}
      <div className={styles.cardList}>
        {filtered.map(p => (
          <div key={p.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.avatar}>{p.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <p className={styles.userName}>{p.name}</p>
                <p className={styles.userEmail}>{p.email}</p>
              </div>
              <span className={p.status === "ativo" ? styles.badgeAtivo : styles.badgeInativo}>
                {p.status === "ativo" ? "Ativa" : "Inativa"}
              </span>
            </div>
            <div className={styles.cardActions}>
              <button className={styles.actionBtn} onClick={() => setViewPaciente(p)}><FontAwesomeIcon icon={faEye} /></button>
              <button className={styles.actionBtn}><FontAwesomeIcon icon={faCalendarPlus} /></button>
              <button className={styles.actionBtn}><FontAwesomeIcon icon={faClipboardList} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL PRONTUÁRIO */}
      {viewPaciente && (
        <div className={styles.modalOverlay} onClick={() => setViewPaciente(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Prontuário — {viewPaciente.name}</h3>
              <button onClick={() => setViewPaciente(null)} className={styles.modalClose}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalAvatar}>{viewPaciente.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}</div>
              <div className={styles.modalGrid}>
                {[
                  { label: "Nome", value: viewPaciente.name },
                  { label: "E-mail", value: viewPaciente.email },
                  { label: "CPF", value: viewPaciente.cpf },
                  { label: "Idade", value: `${viewPaciente.idade} anos` },
                  { label: "Telefone", value: viewPaciente.telefone },
                  { label: "Gênero", value: viewPaciente.genero },
                  { label: "Função Atual", value: viewPaciente.funcao_atual },
                  { label: "Endereço", value: viewPaciente.endereco },
                  { label: "Última Consulta", value: viewPaciente.ultimaConsulta },
                  { label: "Próxima Consulta", value: viewPaciente.proximaConsulta },
                  { label: "Status", value: viewPaciente.status === "ativo" ? "Ativa" : "Inativa" },
                ].map(item => (
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
    </div>
  );
}
