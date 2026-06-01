import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./styles.module.css";
import logo from "../../assets/images/brand.png";
import 'bootstrap/dist/css/bootstrap.min.css';
import { apiService } from "../../services/api";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const data = await apiService.login({ email, password });

      const token = data.accessToken || data.token;
      if (token) {
        localStorage.setItem("@Umanizzare:token", token);
      }

      const role = data.role || data.user?.role;
      if (role) {
        localStorage.setItem("@Umanizzare:role", role);
      }

      const name = data.name || data.nome || data.user?.name || data.user?.nome;
      if (name) {
        localStorage.setItem("@Umanizzare:name", name);
      }

      console.log("Login feito com sucesso!", data);
      navigate("/");
      window.location.reload();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível conectar ao servidor."
      );
    }
  }

  return (
    <div className={`container-fluid p-0 ${styles.container}`}>
      <div className="row g-0 min-vh-100">

        {/* SIDEBAR ESQUERDA */}
        <div className={`col-12 col-lg-5 d-flex flex-column align-items-center justify-content-center py-5 ${styles.sidebar}`}>
          <div className={`${styles.logoArea} text-center`}>
            <img src={logo} alt="Logo Umanizzare" className="img-fluid mb-3" />
            <h1>Umanizzare</h1>
            <h3>INSTITUTO</h3>
          </div>
          <h2 className="d-none d-lg-block mt-3">Login</h2>
        </div>

        {/* SEÇÃO FORMULÁRIO DIREITA */}
        <div className={`col-12 col-lg-7 d-flex align-items-center justify-content-center py-5 ${styles.formSection}`}>
          <div className="w-100 px-3 px-md-5" style={{ maxWidth: "500px" }}>
            <div className={styles.loginCard}>

              <div className={`${styles.header} text-center mb-4`}>
                <h3>Bem vindo de volta</h3>
                <p>Entre para acessar a plataforma</p>
              </div>

              {error && <span className={styles.errorMessage}>{error}</span>}

              <form onSubmit={handleSubmit}>

                <div className={`${styles.inputGroup} mb-3`}>
                  <label>E-mail</label>
                  <input
                    type="email"
                    placeholder="Digite seu e-mail"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className={`${styles.inputGroup} mb-2`}>
                  <label>Senha</label>
                  <input
                    type="password"
                    placeholder="Digite sua senha"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <Link to="/forgot-password" className={styles.forgotPassword}>
                  Esqueceu a senha?
                </Link>

                <button type="submit" className={`${styles.btnEntrar} w-100 mt-3`}>
                  Entrar
                </button>

              </form>

              <p className={`${styles.footerLink} text-center mt-4`}>
                Novo por aqui? <Link to="/register">Cadastre-se</Link>
              </p>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}