// marketplace/frontend/src/components/Register.tsx
import React, { useState, useEffect, useRef } from 'react';
import './Auth.css';
import { useNavigate } from 'react-router-dom';

// Типы для пропсов
interface RegisterProps {
  onRegister: (userData: any) => void;
}

// Типы для формы
interface RegisterFormData {
  nickname: string;
  password: string;
  email: string;
  phone: string;
}

const Register: React.FC<RegisterProps> = ({ onRegister }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    nickname: '',
    password: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Отладка: проверяем, что функции переданы
  useEffect(() => {
    console.log('Register компонент монтирован');
    console.log('onRegister:', typeof onRegister, onRegister);
  }, [onRegister]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('=== ФОРМА ОТПРАВЛЕНА ===');

    // Проверяем, что обязательные поля заполнены
    if (!formData.nickname.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Пожалуйста, заполните все обязательные поля');
      console.log('Ошибка валидации: не все поля заполнены');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Отправляем данные на сервер:', formData);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      console.log('Ответ сервера - статус:', response.status);

      const data = await response.json();
      console.log('Ответ сервера - данные:', data);

      if (response.ok) {
        console.log('Регистрация успешна');
        if (typeof onRegister === 'function') {
          console.log('Вызываем onRegister с данными:', data);
          onRegister(data);
        } else {
          console.error('onRegister не является функцией:', onRegister);
          setError('Ошибка: функция регистрации не определена');
        }
      } else {
        const errorMsg = data.detail || data.message || 'Ошибка регистрации';
        console.log('Ошибка от сервера:', errorMsg);
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error('Ошибка сети при регистрации:', err);
      setError('Ошибка соединения с сервером: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    navigate('/login');
  };

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

  return (
    <div className="auth-container">
      <canvas ref={canvasRef} className="matrix-canvas"></canvas>
      <div className="auth-form">
        <h2>Регистрация</h2>
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
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="tel"
              name="phone"
              placeholder="Телефон (необязательно)"
              value={formData.phone}
              onChange={handleChange}
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
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p>
          Уже есть аккаунт?{' '}
          <button
            type="button"
            className="link-button"
            onClick={handleSwitchToLogin}
            disabled={loading}
          >
            Войти
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
