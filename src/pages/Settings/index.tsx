import { useEffect, useState, useRef } from "react";
import styles from "./styles.module.css";
import { apiService } from "../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera, faTrash, faUser, faPhone,
  faMapMarkerAlt, faIdCard, faSave, faLock, faEye, faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  imagePath?: string;
  cpf?: string;
  idade?: number;
  telefone?: string;
  endereco?: string;
  estado_civil?: string;
  genero?: string;
  orientacao_sexual?: string;
  identificacao_etnico_racial?: string;
  grau_de_escolaridade?: string;
  funcao_atual?: string;
  tem_interesse_em_participar_das_oficinas_do_instituto?: string;
  equipe_de_atendimento?: string;
}

export function Settings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");
  const [genero, setGenero] = useState("");
  const [orientacaoSexual, setOrientacaoSexual] = useState("");
  const [identificacaoEtnicoRacial, setIdentificacaoEtnicoRacial] = useState("");
  const [grauEscolaridade, setGrauEscolaridade] = useState("");
  const [funcaoAtual, setFuncaoAtual] = useState("");
  const [interesseOficinas, setInteresseOficinas] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const BASE_URL = "http://147.93.9.44:8002";

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await (apiService as any).getProfile();
        setProfile(data);
        setName(data.name || "");
        setEmail(data.email || "");
        setTelefone(data.telefone || "");
        setEndereco(data.endereco || "");
        setEstadoCivil(data.estado_civil || "");
        setGenero(data.genero || "");
        setOrientacaoSexual(data.orientacao_sexual || "");
        setIdentificacaoEtnicoRacial(data.identificacao_etnico_racial || "");
        setGrauEscolaridade(data.grau_de_escolaridade || "");
        setFuncaoAtual(data.funcao_atual || "");
        setInteresseOficinas(data.tem_interesse_em_participar_das_oficinas_do_instituto || "");

        // Salva a foto no localStorage ao carregar o perfil
        if (data.imagePath) {
          localStorage.setItem("@Umanizzare:picture", `${BASE_URL}/${data.imagePath}`);
          window.dispatchEvent(new Event("profileUpdated"));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar perfil.");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  function showFeedback(msg: string, type: "success" | "error") {
    if (type === "success") { setSuccess(msg); setError(""); }
    else { setError(msg); setSuccess(""); }
    setTimeout(() => { setSuccess(""); setError(""); }, 4000);
  }

  async function handleSaveProfile() {
    setSaving(true);
    try {
      const body: any = {
        name, email, telefone, endereco,
        estado_civil: estadoCivil,
        genero,
        orientacao_sexual: orientacaoSexual,
        identificacao_etnico_racial: identificacaoEtnicoRacial,
        grau_de_escolaridade: grauEscolaridade,
        funcao_atual: funcaoAtual,
        tem_interesse_em_participar_das_oficinas_do_instituto: interesseOficinas,
      };

      if (newPassword) {
        if (newPassword !== confirmPassword) {
          showFeedback("As senhas não coincidem.", "error");
          setSaving(false);
          return;
        }
        body.password = newPassword;
      }

      await (apiService as any).updateProfile(body);
      localStorage.setItem("@Umanizzare:name", name);
      window.dispatchEvent(new Event("profileUpdated"));
      setNewPassword("");
      setConfirmPassword("");
      showFeedback("Perfil atualizado com sucesso!", "success");
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : "Erro ao salvar.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      await (apiService as any).uploadProfilePicture(file);
      const data = await (apiService as any).getProfile();
      setProfile(data);

      // Salva a foto no localStorage e avisa o Header
      if (data.imagePath) {
        localStorage.setItem("@Umanizzare:picture", `${BASE_URL}/${data.imagePath}`);
        window.dispatchEvent(new Event("profileUpdated"));
      }

      showFeedback("Foto atualizada com sucesso!", "success");
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : "Erro ao enviar foto.", "error");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleDeletePhoto() {
    if (!window.confirm("Remover foto de perfil?")) return;
    try {
      await (apiService as any).deleteProfilePicture();
      setProfile(prev => prev ? { ...prev, imagePath: undefined } : prev);

      // ✅ Remove a foto do localStorage e avisa o Header
      localStorage.removeItem("@Umanizzare:picture");
      window.dispatchEvent(new Event("profileUpdated"));

      showFeedback("Foto removida com sucesso!", "success");
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : "Erro ao remover foto.", "error");
    }
  }

  function getInitials(name: string) {
    return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  }

  function getRoleLabel(role: string) {
    return role === "ADMIN" ? "Administrador" : "Usuário";
  }

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner}></div>
        <p>Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Configurações</h1>
        <p className={styles.subtitle}>Gerencie suas informações pessoais e preferências.</p>
      </div>

      {error && <div className={styles.alertError}>{error}</div>}
      {success && <div className={styles.alertSuccess}>{success}</div>}

      <div className={styles.layout}>

        {/* COLUNA ESQUERDA */}
        <div className={styles.sidebar}>

          <div className={styles.card}>
            <div className={styles.photoWrapper}>
              {profile?.imagePath ? (
                <img
                  src={`${BASE_URL}/${profile.imagePath}`}
                  alt="Foto de perfil"
                  className={styles.photoImg}
                />
              ) : (
                <div className={styles.photoPlaceholder}>
                  {getInitials(name || "U")}
                </div>
              )}
              <button
                className={styles.photoEditBtn}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                title="Alterar foto"
              >
                <FontAwesomeIcon icon={faCamera} />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpg,image/jpeg,image/png,image/gif,image/webp"
              style={{ display: "none" }}
              onChange={handlePhotoUpload}
            />

            <h2 className={styles.profileName}>{name || "—"}</h2>
            <p className={styles.profileRole}>{getRoleLabel(profile?.role || "USER")}</p>
            <p className={styles.profileEmail}>{email || "—"}</p>

            {profile?.imagePath && (
              <button className={styles.btnRemovePhoto} onClick={handleDeletePhoto}>
                <FontAwesomeIcon icon={faTrash} style={{ marginRight: 6 }} />
                Remover foto
              </button>
            )}
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Informações</h3>
            {[
              { icon: faIdCard, label: "CPF", value: profile?.cpf || "—" },
              { icon: faPhone, label: "Telefone", value: profile?.telefone || "—" },
              { icon: faMapMarkerAlt, label: "Endereço", value: profile?.endereco || "—" },
              { icon: faUser, label: "Função", value: profile?.funcao_atual || "—" },
            ].map(item => (
              <div key={item.label} className={styles.infoItem}>
                <FontAwesomeIcon icon={item.icon} className={styles.infoIcon} />
                <div>
                  <p className={styles.infoLabel}>{item.label}</p>
                  <p className={styles.infoValue}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* COLUNA DIREITA */}
        <div className={styles.main}>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FontAwesomeIcon icon={faUser} style={{ marginRight: 8, color: "#800020" }} />
              Dados Pessoais
            </h3>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label>Nome Completo</label>
                <input value={name} onChange={e => setName(e.target.value)} className={styles.input} placeholder="Seu nome" />
              </div>
              <div className={styles.field}>
                <label>E-mail</label>
                <input value={email} onChange={e => setEmail(e.target.value)} className={styles.input} type="email" placeholder="Seu e-mail" />
              </div>
              <div className={styles.field}>
                <label>Telefone</label>
                <input value={telefone} onChange={e => setTelefone(e.target.value)} className={styles.input} placeholder="(00) 00000-0000" />
              </div>
              <div className={styles.field}>
                <label>Função/Trabalho Atual</label>
                <input value={funcaoAtual} onChange={e => setFuncaoAtual(e.target.value)} className={styles.input} placeholder="Sua função" />
              </div>
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label>Endereço Completo</label>
                <input value={endereco} onChange={e => setEndereco(e.target.value)} className={styles.input} placeholder="Rua, número, bairro, cidade" />
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FontAwesomeIcon icon={faIdCard} style={{ marginRight: 8, color: "#800020" }} />
              Dados Sociais
            </h3>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label>Estado Civil</label>
                <input value={estadoCivil} onChange={e => setEstadoCivil(e.target.value)} className={styles.input} placeholder="Estado civil" />
              </div>
              <div className={styles.field}>
                <label>Gênero</label>
                <select value={genero} onChange={e => setGenero(e.target.value)} className={styles.input}>
                  <option value="">Selecione...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Transgênero">Transgênero</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Orientação Sexual</label>
                <select value={orientacaoSexual} onChange={e => setOrientacaoSexual(e.target.value)} className={styles.input}>
                  <option value="">Selecione...</option>
                  <option value="Heterosexual">Heterossexual</option>
                  <option value="Homosexual">Homossexual</option>
                  <option value="Bisexual">Bissexual</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Identificação Étnico-Racial</label>
                <select value={identificacaoEtnicoRacial} onChange={e => setIdentificacaoEtnicoRacial(e.target.value)} className={styles.input}>
                  <option value="">Selecione...</option>
                  <option value="Branca">Branca</option>
                  <option value="Preta">Preta</option>
                  <option value="Parda">Parda</option>
                  <option value="Amarela">Amarela</option>
                  <option value="Indígena">Indígena</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Grau de Escolaridade</label>
                <select value={grauEscolaridade} onChange={e => setGrauEscolaridade(e.target.value)} className={styles.input}>
                  <option value="">Selecione...</option>
                  <option value="Ensino Fundamental completo">Ensino Fundamental completo</option>
                  <option value="Ensino Fundamental incompleto">Ensino Fundamental incompleto</option>
                  <option value="Ensino Médio completo">Ensino Médio completo</option>
                  <option value="Ensino Médio incompleto">Ensino Médio incompleto</option>
                  <option value="Ensino Superior completo">Ensino Superior completo</option>
                  <option value="Ensino Superior incompleto">Ensino Superior incompleto</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Interesse nas oficinas?</label>
                <select value={interesseOficinas} onChange={e => setInteresseOficinas(e.target.value)} className={styles.input}>
                  <option value="">Selecione...</option>
                  <option value="Sim">Sim, tenho interesse</option>
                  <option value="Não">Não possuo interesse</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FontAwesomeIcon icon={faLock} style={{ marginRight: 8, color: "#800020" }} />
              Alterar Senha
            </h3>
            <p className={styles.cardDesc}>Deixe em branco para manter a senha atual.</p>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label>Nova Senha</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className={styles.input}
                    placeholder="Nova senha"
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowNewPassword(p => !p)}>
                    <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>
              <div className={styles.field}>
                <label>Confirmar Nova Senha</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className={styles.input}
                    placeholder="Confirmar senha"
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirmPassword(p => !p)}>
                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.saveBar}>
            <button onClick={handleSaveProfile} disabled={saving} className={styles.btnSave}>
              <FontAwesomeIcon icon={faSave} style={{ marginRight: 8 }} />
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}