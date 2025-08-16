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
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((userData: User) => {
    console.log('Успешный вход:', userData);
    setUser(userData);
  }, []);

  const register = useCallback((userData: User) => {
    console.log('Успешная регистрация:', userData);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    console.log('Выход из системы');
    setUser(null);
  }, []);

  return {
    user,
    login,
    register,
    logout
  };
};