// marketplace/frontend/src/components/Login.tsx
import React, { useState, useEffect, useRef } from 'react';
import './Auth.css';
import { useNavigate } from 'react-router-dom';

// Типы для пропсов
interface LoginProps {
  onLogin: (userData: any) => void;
}

// Типы для формы
interface LoginFormData {
  nickname: string;
  password: string;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    nickname: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Отладка: проверяем, что функции переданы
  useEffect(() => {
    console.log('Login компонент монтирован');
    console.log('onLogin:', typeof onLogin, onLogin);
  }, [onLogin]);

  // Падающие цифры
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

    const letters = '0123456789asdfghjklqwertyuiopzxcvbnm';
    const fontSize = 20;
    const columns = canvas.width / fontSize;
    const drops: number[] = Array(Math.floor(columns)).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0015ff';
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

    const interval = setInterval(draw, 50);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('=== ФОРМА ВХОДА ОТПРАВЛЕНА ===');

    // Проверяем, что обязательные поля заполнены
    if (!formData.nickname.trim() || !formData.password.trim()) {
      setError('Пожалуйста, заполните все поля');
      console.log('Ошибка валидации: не все поля заполнены');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Отправляем данные для входа:', formData);

      const response = await fetch('http://localhost:8001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      console.log('Ответ сервера - статус:', response.status);

      const data = await response.json();
      console.log('Ответ сервера - данные:', data);

      if (response.ok) {
        console.log('Вход успешен');
        if (typeof onLogin === 'function') {
          console.log('Вызываем onLogin с данными:', data.user || data);
          onLogin(data.user || data);
        } else {
          console.error('onLogin не является функцией:', onLogin);
          setError('Ошибка: функция входа не определена');
        }
      } else {
        const errorMsg = data.detail || data.message || 'Ошибка входа';
        console.log('Ошибка от сервера:', errorMsg);
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error('Ошибка сети при входе:', err);
      setError('Ошибка соединения с сервером: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="auth-container">
      <canvas ref={canvasRef} className="matrix-canvas"></canvas>
      <div className="auth-form">
        <h2>Вход</h2>
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="nickname"
              placeholder="Никнейм"
              value={formData.nickname}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p>
          Нет аккаунта?{' '}
          <button
            type="button"
            className="link-button"
            onClick={handleSwitchToRegister}
            disabled={loading}
          >
            Зарегистрироваться
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;