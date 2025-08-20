// marketplace/frontend/src/hooks/useAuth.ts
import { useState, useCallback } from 'react';

interface User {
  id?: number;
  nickname?: string;
  name?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    // Проверяем localStorage при инициализации
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = useCallback((userData: User) => {
    console.log('Успешный вход:', userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const register = useCallback((userData: User) => {
    console.log('Успешная регистрация:', userData);
    // При регистрации не сохраняем пользователя сразу, 
    // так как нужна активация
    // setUser(userData);
  }, []);

  const logout = useCallback(() => {
    console.log('Выход из системы');
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  return {
    user,
    login,
    register,
    logout
  };
};