// marketplace/frontend/src/hooks/useAuth.ts
import { useState, useCallback } from 'react';

interface WbLk {
  id: number;
  name: string;
  token: string;
  number?: number;
  cookie?: string;
  authorizev3?: string;
  inn?: number;
  tg_id?: number;
  owner_id: number;
  is_owner: boolean;
}

interface User {
  id: number;
  nickname: string;
  name?: string;
  email: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  wb_lks: WbLk[];
  [key: string]: any;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    // Проверяем localStorage при инициализации
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const fetchUserProfile = useCallback(async (userId: number): Promise<User | null> => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || '/api';
      const response = await fetch(`${apiUrl}/user/profile`, {
        headers: {
          'X-User-ID': userId.toString(),
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки профиля пользователя');
      }

      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
      return null;
    }
  }, []);

  const login = useCallback(async (userData: any) => {
    console.log('Успешный вход:', userData);
    
    // Загружаем полный профиль пользователя с WB личными кабинетами
    if (userData.id) {
      const fullProfile = await fetchUserProfile(userData.id);
      if (fullProfile) {
        setUser(fullProfile);
        localStorage.setItem('user', JSON.stringify(fullProfile));
      } else {
        // Если не удалось загрузить полный профиль, используем базовые данные
        setUser(userData as User);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } else {
      setUser(userData as User);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  }, [fetchUserProfile]);

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

  const refreshUserProfile = useCallback(async () => {
    if (user?.id) {
      const fullProfile = await fetchUserProfile(user.id);
      if (fullProfile) {
        setUser(fullProfile);
        localStorage.setItem('user', JSON.stringify(fullProfile));
      }
    }
  }, [user?.id, fetchUserProfile]);

  return {
    user,
    login,
    register,
    logout,
    refreshUserProfile,
    fetchUserProfile
  };
};