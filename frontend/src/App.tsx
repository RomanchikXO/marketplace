// marketplace/frontend/src/App.tsx
import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

// Определяем типы пользователя
interface User {
  id?: number;
  nickname?: string;
  name?: string;
  email?: string;
  phone?: string;
  [key: string]: any; // для дополнительных полей от сервера
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<User | null>(null);

  // Функция для успешного входа
  const handleLogin = (userData: User) => {
    console.log('Успешный вход:', userData);
    setUser(userData);
    // Здесь можете добавить логику для сохранения токена, перенаправления и т.д.
  };

  // Функция для успешной регистрации
  const handleRegister = (userData: User) => {
    console.log('Успешная регистрация:', userData);
    setUser(userData);
    // Здесь можете добавить логику для сохранения токена, перенаправления и т.д.
  };

  // Функция для переключения на форму входа
  const switchToLogin = (): void => {
    console.log('Переключение на форму входа');
    setCurrentView('login');
  };

  // Функция для переключения на форму регистрации
  const switchToRegister = (): void => {
    console.log('Переключение на форму регистрации');
    setCurrentView('register');
  };

  // Функция для выхода
  const handleLogout = () => {
    console.log('Выход из системы');
    setUser(null);
    setCurrentView('login');
  };

  // Если пользователь авторизован, показываем Dashboard
  if (user) {
    return (
      <Dashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="App">
      {currentView === 'login' ? (
        <Login 
          onLogin={handleLogin}
          switchToRegister={switchToRegister}
        />
      ) : (
        <Register 
          onRegister={handleRegister}
          switchToLogin={switchToLogin}
        />
      )}
    </div>
  );
};

export default App;