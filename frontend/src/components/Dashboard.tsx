// frontend/src/components/Dashboard.tsx
import React, { useEffect, useRef, useState } from 'react';
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
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const modules: ModuleCard[] = [
    {
      id: 'repricer',
      title: 'Репрайсер',
      description: 'Автоматическое управление ценами',
      icon: '💰',
      color: '#00ff41'
    },
    {
      id: 'dashboard',
      title: 'Дашборд',
      description: 'Аналитика и отчеты',
      icon: '📊',
      color: '#0099ff'
    },
    {
      id: 'sorter',
      title: 'Подсортировщик',
      description: 'Управление ассортиментом',
      icon: '📦',
      color: '#ff6600'
    }
  ];

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

  const handleModuleClick = (moduleId: string) => {
    setActiveModule(moduleId);
  };

  const handleBackToHome = () => {
    setActiveModule(null);
  };

  const renderModuleContent = (moduleId: string) => {
    switch (moduleId) {
      case 'repricer':
        return <Repricer />;
      case 'dashboard':
        return <Analytics />;
      case 'sorter':
        return <Sorter />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <canvas ref={canvasRef} className="matrix-bg"></canvas>

      {/* Боковая панель (показывается только когда выбран модуль) */}
      {activeModule && (
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
                className={`nav-item ${activeModule === module.id ? 'active' : ''}`}
                onClick={() => handleModuleClick(module.id)}
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
            <button className="logout-btn" onClick={onLogout}>
              Выйти
            </button>
          </div>
        </div>
      )}

      {/* Основной контент */}
      <div className={`main-content ${activeModule ? 'with-sidebar' : ''}`}>
        {!activeModule ? (
          // Главная страница с карточками
          <div className="home-view">
            <header className="dashboard-header">
              <h1 className="welcome-title">
                Добро пожаловать, {user.nickname || 'Пользователь'}!
              </h1>
              <button className="logout-btn-header" onClick={onLogout}>
                Выйти
              </button>
            </header>

            <div className="modules-grid">
              {modules.map(module => (
                <div
                  key={module.id}
                  className="module-card"
                  onClick={() => handleModuleClick(module.id)}
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
        ) : (
          // Страница выбранного модуля
          renderModuleContent(activeModule)
        )}
      </div>
    </div>
  );
};

export default Dashboard;