import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./styles.module.css";
import logo from "../../assets/images/brand.png";
import { apiService } from "../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export function Register() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Etapa 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visualizar senha
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Etapa 2
  const [dataAcolhimento, setDataAcolhimento] = useState("");
  const [horario, setHorario] = useState("");
  const [equipeAtendimento, setEquipeAtendimento] = useState("");
  const [cpf, setCpf] = useState("");
  const [idade, setIdade] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [orgaoEncaminhamento, setOrgaoEncaminhamento] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");
  const [genero, setGenero] = useState("");
  const [orientacaoSexual, setOrientacaoSexual] = useState("");
  const [identificacaoEtnicoRacial, setIdentificacaoEtnicoRacial] = useState("");
  const [grauEscolaridade, setGrauEscolaridade] = useState("");
  const [funcaoAtual, setFuncaoAtual] = useState("");
  const [interesseOficinas, setInteresseOficinas] = useState("");

  function handleNextStep() {
    setError("");
    if (!email || !name || !confirmEmail || !password || !confirmPassword) {
      setError("Todos os campos são obrigatórios.");
      return;
    }
    if (email !== confirmEmail) {
      setError("Os e-mails informados não coincidem.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas informadas não coincidem.");
      return;
    }
    setStep(2);
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setCpf(value);
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 11);
    value = value.replace(/(\d{2})(\d)/, "($1) $2");
    value = value.replace(/(\d{5})(\d)/, "$1-$2");
    setTelefone(value);
  };

  async function handleRegister(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!dataAcolhimento || !horario || !cpf || !idade || !telefone) {
      setError("Por favor, preencha os dados principais do acolhimento.");
      return;
    }

    const ageNumber = Number(idade);
    if (ageNumber < 0 || ageNumber > 150) {
      setError("Por favor, coloque uma idade válida.");
      return;
    }

    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11) {
      setError("O CPF deve conter 11 dígitos.");
      return;
    }

    try {
      await apiService.register({
        data_do_Acolhimento: dataAcolhimento,
        horario,
        equipe_de_atendimento: equipeAtendimento,
        name,
        cpf: cleanCpf,
        idade: ageNumber,
        telefone,
        endereco,
        orgao_responsavel_pelo_encaminhamento: orgaoEncaminhamento,
        estado_civil: estadoCivil,
        genero,
        orientacao_sexual: orientacaoSexual,
        identificacao_etnico_racial: identificacaoEtnicoRacial,
        grau_de_escolaridade: grauEscolaridade,
        funcao_atual: funcaoAtual,
        tem_interesse_em_participar_das_oficinas_do_instituto: interesseOficinas,
        email,
        password,
      });

      alert("Cadastro e ficha de acolhimento criados com sucesso!");
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível conectar ao servidor.");
    }
  }

  return (
    <div className={`container-fluid p-0 ${styles.pageWrapper}`}>
      <div className="row g-0 min-vh-100">

        {/* SIDEBAR ESQUERDA */}
        <div className={`col-12 col-lg-5 d-flex flex-column align-items-center justify-content-center py-5 ${styles.sidebar}`}>
          <div className={`${styles.logoArea} text-center`}>
            <img src={logo} alt="Logo Umanizzare" className="img-fluid mb-3" />
            <h1>Umanizzare</h1>
            <h3>INSTITUTO</h3>
          </div>
          <h2 className="mt-3">{step === 1 ? "Cadastro" : "Ficha de Acolhimento"}</h2>
        </div>

        {/* SEÇÃO FORMULÁRIO DIREITA */}
        <div className={`col-12 col-lg-7 d-flex align-items-start align-items-lg-center justify-content-center py-5 ${styles.formSection}`}>
          <div className="w-100 px-3 px-md-5" style={{ maxWidth: "560px" }}>
            <div className={styles.loginCard}>

              <div className={`${styles.header} text-center mb-4`}>
                <h3>{step === 1 ? "Crie sua conta" : "Dados de Acolhimento"}</h3>
                <p>{step === 1 ? "Preencha os dados para acessar a plataforma" : "Preencha os dados da ficha de acolhimento"}</p>
              </div>

              {error && <span className={styles.errorMessage}>{error}</span>}

              <form onSubmit={handleRegister}>

                {/* ETAPA 1 */}
                {step === 1 && (
                  <>
                    <div className={`${styles.inputGroup} mb-3`}>
                      <label>Nome Completo</label>
                      <input type="text" className="form-control" placeholder="Digite seu nome completo" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div className={`${styles.inputGroup} mb-3`}>
                      <label>E-mail</label>
                      <input type="email" className="form-control" placeholder="Digite seu melhor e-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div className={`${styles.inputGroup} mb-3`}>
                      <label>Confirmar E-mail</label>
                      <input type="email" className="form-control" placeholder="Repita seu e-mail" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} />
                    </div>

                    <div className={`${styles.inputGroup} mb-3`}>
                      <label>Senha</label>
                      <div className={styles.passwordWrapper}>
                        <input
                          type={showPassword ? "text" : "password"}
                          className={`form-control ${styles.passwordInput}`}
                          placeholder="Crie uma senha forte"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(p => !p)} tabIndex={-1}>
                          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </button>
                      </div>
                    </div>

                    <div className={`${styles.inputGroup} mb-4`}>
                      <label>Confirmar Senha</label>
                      <div className={styles.passwordWrapper}>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className={`form-control ${styles.passwordInput}`}
                          placeholder="Repita a senha criada"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirmPassword(p => !p)} tabIndex={-1}>
                          <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                        </button>
                      </div>
                    </div>

                    <button type="button" onClick={handleNextStep} className={`${styles.btnCadastrar} w-100`}>
                      Continuar para o Questionário
                    </button>
                  </>
                )}

                {/* ETAPA 2 */}
                {step === 2 && (
                  <>
                    <div className="row g-3">
                      <div className="col-12 col-sm-6">
                        <div className={styles.inputGroup}>
                          <label>Data de Acolhimento</label>
                          <input type="date" className="form-control" value={dataAcolhimento} onChange={(e) => setDataAcolhimento(e.target.value)} />
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className={styles.inputGroup}>
                          <label>Horário</label>
                          <input type="time" className="form-control" value={horario} onChange={(e) => setHorario(e.target.value)} />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className={styles.inputGroup}>
                          <label>Equipe de Atendimento</label>
                          <input type="text" className="form-control" placeholder="Equipe de Atendimento" value={equipeAtendimento} onChange={(e) => setEquipeAtendimento(e.target.value)} />
                        </div>
                      </div>
                      <div className="col-12 col-sm-8">
                        <div className={styles.inputGroup}>
                          <label>CPF</label>
                          <input type="text" className="form-control" placeholder="000.000.000-00" value={cpf} onChange={handleCpfChange} maxLength={14} />
                        </div>
                      </div>
                      <div className="col-12 col-sm-4">
                        <div className={styles.inputGroup}>
                          <label>Idade</label>
                          <input type="number" className="form-control" placeholder="Idade" value={idade} onChange={(e) => setIdade(e.target.value)} min="0" max="150" />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className={styles.inputGroup}>
                          <label>Telefone</label>
                          <input type="tel" className="form-control" placeholder="(00) 00000-0000" value={telefone} onChange={handleTelefoneChange} maxLength={15} />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className={styles.inputGroup}>
                          <label>Endereço Residencial Completo</label>
                          <input type="text" className="form-control" placeholder="Endereço Residencial Completo" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className={styles.inputGroup}>
                          <label>Órgão responsável pelo encaminhamento</label>
                          <input type="text" className="form-control" placeholder="Órgão responsável pelo encaminhamento" value={orgaoEncaminhamento} onChange={(e) => setOrgaoEncaminhamento(e.target.value)} />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className={styles.inputGroup}>
                          <label>Estado Civil</label>
                          <select className="form-select" value={estadoCivil} onChange={(e) => setEstadoCivil(e.target.value)}>
                            <option value="">Selecione...</option>
                            <option value="Solteiro(a)">Solteiro(a)</option>
                            <option value="Casado(a)">Casado(a)</option>
                            <option value="Divorciado(a)">Divorciado(a)</option>
                            <option value="Viúvo(a)">Viúvo(a)</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className={styles.inputGroup}>
                          <label>Gênero</label>
                          <select className="form-select" value={genero} onChange={(e) => setGenero(e.target.value)}>
                            <option value="">Selecione...</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Feminino">Feminino</option>
                            <option value="Transgênero">Transgênero</option>
                            <option value="Outro">Outro</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className={styles.inputGroup}>
                          <label>Orientação Sexual</label>
                          <select className="form-select" value={orientacaoSexual} onChange={(e) => setOrientacaoSexual(e.target.value)}>
                            <option value="">Selecione...</option>
                            <option value="Heterosexual">Heterosexual</option>
                            <option value="Homosexual">Homosexual</option>
                            <option value="Bisexual">Bisexual</option>
                            <option value="Outro">Outro</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className={styles.inputGroup}>
                          <label>Identificação Étnico-Racial</label>
                          <select className="form-select" value={identificacaoEtnicoRacial} onChange={(e) => setIdentificacaoEtnicoRacial(e.target.value)}>
                            <option value="">Selecione...</option>
                            <option value="Branca">Branca</option>
                            <option value="Preta">Preta</option>
                            <option value="Parda">Parda</option>
                            <option value="Amarela">Amarela</option>
                            <option value="Indígena">Indígena</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className={styles.inputGroup}>
                          <label>Grau de Escolaridade</label>
                          <select className="form-select" value={grauEscolaridade} onChange={(e) => setGrauEscolaridade(e.target.value)}>
                            <option value="">Selecione...</option>
                            <option value="Ensino Fundamental completo">Ensino Fundamental completo</option>
                            <option value="Ensino Fundamental incompleto">Ensino Fundamental incompleto</option>
                            <option value="Ensino Médio completo">Ensino Médio completo</option>
                            <option value="Ensino Médio incompleto">Ensino Médio incompleto</option>
                            <option value="Ensino Superior completo">Ensino Superior completo</option>
                            <option value="Ensino Superior incompleto">Ensino Superior incompleto</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className={styles.inputGroup}>
                          <label>Função/Trabalho Atual</label>
                          <input type="text" className="form-control" placeholder="Função/Trabalho Atual" value={funcaoAtual} onChange={(e) => setFuncaoAtual(e.target.value)} />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className={styles.inputGroup}>
                          <label>Interesse nas oficinas do instituto?</label>
                          <select className="form-select" value={interesseOficinas} onChange={(e) => setInteresseOficinas(e.target.value)}>
                            <option value="">Selecione...</option>
                            <option value="Sim">Sim, tenho interesse</option>
                            <option value="Não">Não possuo interesse</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex gap-3 mt-4">
                      <button type="button" onClick={() => setStep(1)} className={`${styles.backButton} flex-fill`}>
                        Voltar
                      </button>
                      <button type="submit" className={`${styles.btnCadastrar} flex-fill`} style={{ flex: 2 }}>
                        Finalizar Cadastro
                      </button>
                    </div>
                  </>
                )}

              </form>

              <p className={`${styles.footerLink} text-center mt-4`}>
                Já tem uma conta? <Link to="/login">Faça o Login</Link>
              </p>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}