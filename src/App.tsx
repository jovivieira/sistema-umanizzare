import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';
import './styles/theme.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { UsersManagement } from './pages/UsersManagement'; 

function AppRoutes() {
  const location = useLocation();
  const rotasSemNavegacao = ['/login', '/register'];
  const esconderNavegacao = rotasSemNavegacao.includes(location.pathname);

  return (
    <div className="app-wrapper" style={{ display: 'flex', minHeight: '100vh' }}>
      {!esconderNavegacao && <Header />}
      <div 
        style={{ 
          flex: 1, 
          marginLeft: esconderNavegacao ? '0px' : '300px', 
          display: 'flex',
          flexDirection: 'column',
          width: '100%'
        }}
      >
        <main style={{ flex: 1, width: '100%' }}>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
           <Route path='/admin/users' element={<UsersManagement />} />
          </Routes>
        </main>
        {!esconderNavegacao && <Footer />}
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