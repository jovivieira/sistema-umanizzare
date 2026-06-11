import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';
import './styles/theme.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { HomeHeader } from './components/HomeHeader';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { UsersManagement } from './pages/UsersManagement';
import { Settings } from './pages/Settings';
import { PatientDashboard } from './pages/PatientDashboard';
import { Patients } from './pages/Patients';
import { Documents } from './pages/Documents';
import { Reports } from './pages/Reports';

function AppRoutes() {
  const location = useLocation();
  const token = localStorage.getItem("@Umanizzare:token");
  const isAuthenticated = !!token;
  const rotasSemNavegacao = ['/login', '/register'];
  const esconderNavegacao = rotasSemNavegacao.includes(location.pathname);
  const isHomeSemLogin = location.pathname === '/' && !isAuthenticated;

  return (
    <div className="app-wrapper" style={{ display: 'flex', flexDirection: isHomeSemLogin ? 'column' : 'row', minHeight: '100vh' }}>
      {isHomeSemLogin && <HomeHeader />}
      {!esconderNavegacao && !isHomeSemLogin && <Header />}
      <div style={{
        flex: 1,
        marginLeft: (!esconderNavegacao && !isHomeSemLogin) ? '300px' : '0px',
        display: 'flex',
        flexDirection: 'column',
        width: (!esconderNavegacao && !isHomeSemLogin) ? 'calc(100% - 300px)' : '100%',
      }}>
        <main style={{ flex: 1, width: '100%' }}>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/admin/users' element={<UsersManagement />} />
            <Route path='/settings' element={<Settings />} />
            <Route path='/dashboard' element={<PatientDashboard />} />
            <Route path='/patients' element={<Patients />} />
            <Route path='/documents' element={<Documents />} />
            <Route path='/reports' element={<Reports />} />
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

