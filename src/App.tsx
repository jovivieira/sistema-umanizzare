import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';
import './styles/theme.css';
import { BrowserRouter, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { HomeHeader } from './components/HomeHeader';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { UsersManagement } from './pages/UsersManagement';
import { Settings } from './pages/Settings';
import { TakeQuestionnaire } from './pages/TakeQuestionnaire';
import { QuestionnaireManagement } from './pages/QuestionnaireManagement';
import { PatientDashboard } from './pages/PatientDashboard';
import { Patients } from './pages/Patients';
import { Documents } from './pages/Documents';
import { Reports } from './pages/Reports';

function AppRoutes() {
  const location = useLocation();
  const token = localStorage.getItem("@Umanizzare:token");
  const role = localStorage.getItem("@Umanizzare:role");
  const isAuthenticated = !!token;
  const isPaciente = role === "USER" || role === "PACIENTE";

  const rotasSemNavegacao = ['/login', '/register'];
  const rotasSemHeader = ['/dashboard'];

  const esconderNavegacao = rotasSemNavegacao.includes(location.pathname);
  const isHomeSemLogin = location.pathname === '/' && !isAuthenticated;
  const layoutProprio = rotasSemHeader.includes(location.pathname);

  const mostrarHeader = !esconderNavegacao && !isHomeSemLogin && !layoutProprio;
  const mostrarFooter = !esconderNavegacao && !isHomeSemLogin && !layoutProprio;

  return (
    <div
      className="app-wrapper"
      style={{
        display: 'flex',
        flexDirection: isHomeSemLogin ? 'column' : 'row',
        minHeight: '100vh',
      }}
    >
      {isHomeSemLogin && <HomeHeader />}
      {mostrarHeader && <Header />}

      <div
        style={{
          flex: 1,
          marginLeft: mostrarHeader ? '300px' : '0px',
          display: 'flex',
          flexDirection: 'column',
          width: mostrarHeader ? 'calc(100% - 300px)' : '100%',
        }}
      >
        <main style={{ flex: 1, width: '100%' }}>
          <Routes>
            {/* Redireciona paciente para o dashboard */}
            <Route
              path='/'
              element={
                isAuthenticated && isPaciente
                  ? <Navigate to="/dashboard" replace />
                  : <Home />
              }
            />

            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/admin/users' element={<UsersManagement />} />
            <Route path='/settings' element={<Settings />} />
            <Route path='/questionnaire/:id' element={<TakeQuestionnaire />} />
            <Route path='/admin/questionnaires' element={<QuestionnaireManagement />} />
            <Route path='/dashboard' element={<PatientDashboard />} />
            <Route path='/patients' element={<Patients />} />
            <Route path='/documents' element={<Documents />} />
            <Route path='/reports' element={<Reports />} />

            <Route path='*' element={
              <div className="text-center mt-5 py-5">
                <h2 className="text-muted">Página não encontrada</h2>
                <Link to="/" className="btn btn-primary mt-3">Voltar para o Início</Link>
              </div>
            } />
          </Routes>
        </main>

        {mostrarFooter && <Footer />}
      </div>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}