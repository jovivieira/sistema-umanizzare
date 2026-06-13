import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';
import './styles/theme.css';
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
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

function AppRoutes() {
  const location = useLocation();
  const token = localStorage.getItem("@Umanizzare:token");
  const isAuthenticated = !!token;

  const rotasSemNavegacao = ['/login', '/register'];
  const esconderNavegacao = rotasSemNavegacao.includes(location.pathname);

  // Home sem login: header simples no topo, sem sidebar
  const isHomeSemLogin = location.pathname === '/' && !isAuthenticated;

  return (
    <div className="app-wrapper" style={{ display: 'flex', flexDirection: isHomeSemLogin ? 'column' : 'row', minHeight: '100vh' }}>

      {/* Header simples para home sem login */}
      {isHomeSemLogin && <HomeHeader />}

      {/* Sidebar normal para usuários logados */}
      {!esconderNavegacao && !isHomeSemLogin && <Header />}

      <div
        style={{
          flex: 1,
          marginLeft: (!esconderNavegacao && !isHomeSemLogin) ? '300px' : '0px',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        }}
      >
        <main style={{ flex: 1, width: '100%' }}>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/admin/users' element={<UsersManagement />} />
            <Route path='/settings' element={<Settings />} />
            <Route path='/questionnaire/:id' element={<TakeQuestionnaire />} />
            <Route path='/admin/questionnaires' element={<QuestionnaireManagement />} />

            {/* Pagina Nao Encontrada */}
            <Route path='*' element={
              <div className="text-center mt-5 py-5">
                <h2 className="text-muted">Página não encontrada</h2>
                <Link to="/" className="btn btn-primary mt-3">Voltar para o Início</Link>
              </div> } />
          </Routes>
        </main>
        {!esconderNavegacao && !isHomeSemLogin && <Footer />}
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