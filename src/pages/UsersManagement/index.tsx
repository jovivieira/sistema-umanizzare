import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";
import { apiService } from "../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers, faUserCheck, faUserXmark, faUserShield,
  faEye, faPen, faLock, faLockOpen, faTrash,
  faUserPlus, faMagnifyingGlass, faXmark,
  faChevronLeft, faChevronRight, faAnglesLeft, faAnglesRight,
  faFaceFrown,
} from "@fortawesome/free-solid-svg-icons";

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "PSICOLOGO" | "PACIENTE";
  cpf?: string;
  idade?: number;
  telefone?: string;
  endereco?: string;
  estado_civil?: string;
  genero?: string;
  funcao_atual?: string;
}

// ✅ Carrega inativos do localStorage
function loadInactiveIds(): Set<string> {
  try {
    const saved = localStorage.getItem("@Umanizzare:inactiveUsers");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch {
    return new Set();
  }
}

// ✅ Salva inativos no localStorage
function saveInactiveIds(ids: Set<string>) {
  localStorage.setItem("@Umanizzare:inactiveUsers", JSON.stringify([...ids]));
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [inactiveIds, setInactiveIds] = useState<Set<string>>(loadInactiveIds);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<User["role"]>("USER");
  const [editLoading, setEditLoading] = useState(false);

  const [loggedPicture, setLoggedPicture] = useState(
    localStorage.getItem("@Umanizzare:picture") || ""
  );

  const navigate = useNavigate();
  const loggedName = localStorage.getItem("@Umanizzare:name") || "Usuário";
  const loggedRole = localStorage.getItem("@Umanizzare:role") || "USER";
  const isAdm = loggedRole === "ADMIN";

  useEffect(() => {
    let isMounted = true;
    async function loadUsers() {
      try {
        const data = await apiService.getUsers();
        if (isMounted) setUsers(Array.isArray(data) ? data : data.users || []);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : "Erro ao carregar usuários.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadUsers();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    function handleUpdate() {
      setLoggedPicture(localStorage.getItem("@Umanizzare:picture") || "");
    }
    window.addEventListener("profileUpdated", handleUpdate);
    return () => window.removeEventListener("profileUpdated", handleUpdate);
  }, []);

  function getRoleLabel(role: string) {
    switch (role) {
      case "ADMIN": return "Administrador";
      case "PSICOLOGO": return "Psicólogo";
      case "PACIENTE": return "Paciente";
      default: return "Usuário";
    }
  }

  function getRoleBadgeClass(role: string) {
    switch (role) {
      case "ADMIN": return styles.badgeAdm;
      case "PSICOLOGO": return styles.badgePsicologo;
      case "PACIENTE": return styles.badgePaciente;
      default: return styles.badgeUser;
    }
  }

  function getInitials(name: string) {
    return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  }

  // ✅ Persiste no localStorage ao togglear
  function toggleInactive(id: string) {
    setInactiveIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      saveInactiveIds(next);
      return next;
    });
  }

  async function handleDelete(id: string, name: string) {
    if (!isAdm) return;
    if (!window.confirm(`Excluir o usuário ${name}?`)) return;
    try {
      await apiService.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      // Remove dos inativos também
      setInactiveIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        saveInactiveIds(next);
        return next;
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir.");
    }
  }

  function openEdit(user: User) {
    setEditUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
  }

  async function handleSaveEdit() {
    if (!editUser) return;
    setEditLoading(true);
    try {
      await (apiService as any).updateUser(editUser.id, {
        name: editName,
        email: editEmail,
        role: editRole,
      });
      setUsers(prev => prev.map(u =>
        u.id === editUser.id ? { ...u, name: editName, email: editEmail, role: editRole } : u
      ));
      setEditUser(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setEditLoading(false);
    }
  }

  const filteredUsers = users.filter(u => {
    const s = searchTerm.toLowerCase();
    return u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
  });

  const totalAdmins = users.filter(u => u.role === "ADMIN").length;
  const totalAtivos = users.filter(u => !inactiveIds.has(u.id)).length;
  const totalInativos = users.filter(u => inactiveIds.has(u.id)).length;

  const indexOfFirst = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfFirst + itemsPerPage);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner}></div>
        <p>Carregando usuários...</p>
      </div>
    );
  }

  const stats = [
    { icon: faUsers, label: "Total de usuários", value: users.length, desc: "Usuários cadastrados", color: "#fdecea", iconColor: "#800020" },
    { icon: faUserCheck, label: "Usuários ativos", value: totalAtivos, desc: `${users.length > 0 ? Math.round((totalAtivos / users.length) * 100) : 0}% do total`, color: "#e8f5e9", iconColor: "#2e7d32" },
    { icon: faUserXmark, label: "Usuários inativos", value: totalInativos, desc: `${users.length > 0 ? Math.round((totalInativos / users.length) * 100) : 0}% do total`, color: "#fff3e0", iconColor: "#e65100" },
    { icon: faUserShield, label: "Administradores", value: totalAdmins, desc: `${users.length > 0 ? Math.round((totalAdmins / users.length) * 100) : 0}% do total`, color: "#f3e5f5", iconColor: "#6a1b9a" },
  ];

  return (
    <div className={styles.page}>

      {/* TOPBAR */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.title}>Gerenciamento de Usuários</h1>
          <p className={styles.subtitle}>Visualize e gerencie todos os usuários do sistema.</p>
        </div>
        <div className={styles.topBarRight}>
          {isAdm && (
            <button className={styles.btnNew} onClick={() => navigate("/register")}>
              <FontAwesomeIcon icon={faUserPlus} style={{ marginRight: 8 }} />
              Novo paciente
            </button>
          )}
          <div className={styles.userBadge}>
            {loggedPicture ? (
              <img src={loggedPicture} alt={loggedName} className={styles.userBadgeImg} />
            ) : (
              <div className={styles.userBadgeAvatar}>{getInitials(loggedName)}</div>
            )}
            <div>
              <p className={styles.userBadgeName}>{loggedName}</p>
              <p className={styles.userBadgeRole}>{getRoleLabel(loggedRole)}</p>
            </div>
          </div>
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* STATS */}
      <div className={styles.statsGrid}>
        {stats.map(s => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: s.color }}>
              <FontAwesomeIcon icon={s.icon} style={{ color: s.iconColor, fontSize: "1.3rem" }} />
            </div>
            <div>
              <p className={styles.statLabel}>{s.label}</p>
              <h3 className={styles.statNumber}>{s.value}</h3>
              <p className={styles.statDesc}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* TOOLBAR */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar usuário por nome ou e-mail..."
            value={searchTerm}
            onChange={e => { 
              setSearchTerm(e.target.value); 
              setCurrentPage(1); 
            }}
            className={styles.searchInput}
          />
        </div>
        {searchTerm && (
          <button className={styles.clearBtn} onClick={() => { setSearchTerm(""); setCurrentPage(1); }}>
            <FontAwesomeIcon icon={faXmark} style={{ marginRight: 6 }} />
            Limpar filtros
          </button>
        )}
      </div>

      {/* TABELA desktop */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Usuário</th>
              <th>E-mail</th>
              <th>Nível</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? currentUsers.map(user => (
              <tr key={user.id} className={inactiveIds.has(user.id) ? styles.rowInactive : ""}>
                <td>
                  <div className={styles.userInfo}>
                    <div className={styles.avatar}>{getInitials(user.name)}</div>
                    <div>
                      <p className={styles.userName}>{user.name}</p>
                      <p className={styles.userEmail}>{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className={styles.emailCell}>{user.email}</td>
                <td>
                  <span className={getRoleBadgeClass(user.role)}>
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td>
                  <span className={inactiveIds.has(user.id) ? styles.badgeInativo : styles.badgeAtivo}>
                    {inactiveIds.has(user.id) ? "Inativo" : "Ativo"}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.actionBtn} title="Visualizar" onClick={() => setViewUser(user)}>
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    {isAdm && <>
                      <button className={styles.actionBtn} title="Editar" onClick={() => openEdit(user)}>
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                      <button
                        className={styles.actionBtn}
                        title={inactiveIds.has(user.id) ? "Ativar" : "Inativar"}
                        onClick={() => toggleInactive(user.id)}
                      >
                        <FontAwesomeIcon icon={inactiveIds.has(user.id) ? faLockOpen : faLock} />
                      </button>
                      <button className={`${styles.actionBtn} ${styles.actionBtnDelete}`} title="Excluir" onClick={() => handleDelete(user.id, user.name)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </>}
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5}>
                <div className={styles.emptyState}>
                  <FontAwesomeIcon icon={faFaceFrown} style={{ fontSize: "2rem", marginBottom: 8 }} />
                  <p>Nenhum usuário encontrado.</p>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CARDS mobile */}
      <div className={styles.cardList}>
        {currentUsers.map(user => (
          <div key={user.id} className={`${styles.card} ${inactiveIds.has(user.id) ? styles.cardInactive : ""}`}>
            <div className={styles.cardHeader}>
              <div className={styles.avatar}>{getInitials(user.name)}</div>
              <div className={styles.cardInfo}>
                <p className={styles.userName}>{user.name}</p>
                <p className={styles.userEmail}>{user.email}</p>
              </div>
              <span className={getRoleBadgeClass(user.role)}>
                {getRoleLabel(user.role)}
              </span>
            </div>
            <div className={styles.cardActions}>
              <button className={styles.actionBtn} onClick={() => setViewUser(user)}>
                <FontAwesomeIcon icon={faEye} />
              </button>
              {isAdm && <>
                <button className={styles.actionBtn} onClick={() => openEdit(user)}>
                  <FontAwesomeIcon icon={faPen} />
                </button>
                <button className={styles.actionBtn} onClick={() => toggleInactive(user.id)}>
                  <FontAwesomeIcon icon={inactiveIds.has(user.id) ? faLockOpen : faLock} />
                </button>
                <button className={`${styles.actionBtn} ${styles.actionBtnDelete}`} onClick={() => handleDelete(user.id, user.name)}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </>}
            </div>
          </div>
        ))}
      </div>

      {/* PAGINAÇÃO */}
      <div className={styles.paginationBar}>
        <p className={styles.paginationInfo}>
          Mostrando {filteredUsers.length === 0 ? 0 : indexOfFirst + 1} a {Math.min(indexOfFirst + itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuários
        </p>
        <div className={styles.pagination}>
          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className={styles.pageBtn}>
            <FontAwesomeIcon icon={faAnglesLeft} />
          </button>
          <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className={styles.pageBtn}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setCurrentPage(p)} className={`${styles.pageBtn} ${currentPage === p ? styles.pageBtnActive : ""}`}>{p}</button>
          ))}
          <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className={styles.pageBtn}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className={styles.pageBtn}>
            <FontAwesomeIcon icon={faAnglesRight} />
          </button>
        </div>
        <div className={styles.itemsPerPage}>
          <span>Itens por página:</span>
          <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className={styles.itemsSelect}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {/* MODAL VISUALIZAR */}
      {viewUser && (
        <div className={styles.modalOverlay} onClick={() => setViewUser(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Detalhes do Usuário</h3>
              <button onClick={() => setViewUser(null)} className={styles.modalClose}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalAvatar}>{getInitials(viewUser.name)}</div>
              <div className={styles.modalGrid}>
                {[
                  { label: "Nome", value: viewUser.name },
                  { label: "E-mail", value: viewUser.email },
                  { label: "Nível", value: getRoleLabel(viewUser.role) },
                  { label: "Status", value: inactiveIds.has(viewUser.id) ? "Inativo" : "Ativo" },
                  { label: "CPF", value: viewUser.cpf || "—" },
                  { label: "Idade", value: viewUser.idade ? `${viewUser.idade} anos` : "—" },
                  { label: "Telefone", value: viewUser.telefone || "—" },
                  { label: "Endereço", value: viewUser.endereco || "—" },
                  { label: "Estado Civil", value: viewUser.estado_civil || "—" },
                  { label: "Gênero", value: viewUser.genero || "—" },
                  { label: "Função Atual", value: viewUser.funcao_atual || "—" },
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

      {/* MODAL EDITAR */}
      {editUser && (
        <div className={styles.modalOverlay} onClick={() => setEditUser(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Editar Usuário</h3>
              <button onClick={() => setEditUser(null)} className={styles.modalClose}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.editField}>
                <label>Nome</label>
                <input value={editName} onChange={e => setEditName(e.target.value)} className={styles.editInput} />
              </div>
              <div className={styles.editField}>
                <label>E-mail</label>
                <input value={editEmail} onChange={e => setEditEmail(e.target.value)} className={styles.editInput} type="email" />
              </div>
              <div className={styles.editField}>
                <label>Nível</label>
                <select value={editRole} onChange={e => setEditRole(e.target.value as User["role"])} className={styles.editInput}>
                  <option value="USER">Usuário</option>
                  <option value="PACIENTE">Paciente</option>
                  <option value="PSICOLOGO">Psicólogo</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div className={styles.modalFooter}>
                <button onClick={() => setEditUser(null)} className={styles.btnCancel}>Cancelar</button>
                <button onClick={handleSaveEdit} disabled={editLoading} className={styles.btnSave}>
                  {editLoading ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}