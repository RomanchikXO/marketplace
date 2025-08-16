// marketplace/frontend/src/components/Dashboard.tsx
import React, { useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Repricer, Analytics, Sorter } from './modules';
import './Dashboard.css';

interface User {
  id?: number;
  nickname?: string;
  name?: string;
  email?: string;
  [key: string]: any;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

interface ModuleCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  path: string;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const modules: ModuleCard[] = [
    {
      id: 'repricer',
      title: 'Репрайсер',
      description: 'Автоматическое управление ценами',
      icon: '💰',
      color: '#00ff41',
      path: '/dashboard/repricer'
    },
    {
      id: 'analytics',
      title: 'Дашборд',
      description: 'Аналитика и отчеты',
      icon: '📊',
      color: '#0099ff',
      path: '/dashboard/analytics'
    },
    {
      id: 'sorter',
      title: 'Подсортировщик',
      description: 'Управление ассортиментом',
      icon: '📦',
      color: '#ff6600',
      path: '/dashboard/sorter'
    }
  ];

  const isHomePage = location.pathname === '/dashboard' || location.pathname === '/dashboard/';
  const currentModule = modules.find(m => location.pathname.startsWith(m.path));

  // Матричный фон
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const letters = '0123456789abcdefghijklmnopqrstuvwxyz';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = Array(Math.floor(columns)).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00ff41';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 35);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const handleModuleClick = (path: string) => {
    navigate(path);
  };

  const handleBackToHome = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <canvas ref={canvasRef} className="matrix-bg"></canvas>

      {/* Боковая панель (показывается только когда выбран модуль) */}
      {!isHomePage && (
        <div className="sidebar">
          <div className="sidebar-header">
            <button className="back-btn" onClick={handleBackToHome}>
              ← Главная
            </button>
          </div>
          <nav className="sidebar-nav">
            {modules.map(module => (
              <button
                key={module.id}
                className={`nav-item ${currentModule?.id === module.id ? 'active' : ''}`}
                onClick={() => handleModuleClick(module.path)}
                style={{ borderLeft: `3px solid ${module.color}` }}
              >
                <span className="nav-icon">{module.icon}</span>
                <span className="nav-title">{module.title}</span>
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="user-info">
              <span>👤 {user.nickname || 'Пользователь'}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Выйти
            </button>
          </div>
        </div>
      )}

      {/* Основной контент */}
      <div className={`main-content ${!isHomePage ? 'with-sidebar' : ''}`}>
        <Routes>
          {/* Главная страница дашборда */}
          <Route
            path="/"
            element={
              <div className="home-view">
                <header className="dashboard-header">
                  <h1 className="welcome-title">
                    Добро пожаловать, {user.nickname || 'Пользователь'}!
                  </h1>
                  <button className="logout-btn-header" onClick={handleLogout}>
                    Выйти
                  </button>
                </header>

                <div className="modules-grid">
                  {modules.map(module => (
                    <div
                      key={module.id}
                      className="module-card"
                      onClick={() => handleModuleClick(module.path)}
                      style={{
                        borderColor: module.color,
                        boxShadow: `0 0 20px ${module.color}33`
                      }}
                    >
                      <div className="module-icon" style={{ color: module.color }}>
                        {module.icon}
                      </div>
                      <h3 className="module-title">{module.title}</h3>
                      <p className="module-description">{module.description}</p>
                      <div
                        className="module-glow"
                        style={{ background: `${module.color}11` }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            }
          />

          {/* Маршруты модулей */}
          <Route path="/repricer" element={<Repricer />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/sorter" element={<Sorter />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;