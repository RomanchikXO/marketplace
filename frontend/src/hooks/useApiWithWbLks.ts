import { useWbLkContext } from '../contexts/WbLkContext';
import { useCallback } from 'react';

export const useApiWithWbLks = () => {
  const { selectedWbLks } = useWbLkContext();

  const buildApiUrl = useCallback((endpoint: string, params?: Record<string, any>) => {
    const apiUrl = process.env.REACT_APP_API_URL || '/api';
    const url = new URL(`${apiUrl}${endpoint}`);
    
    // Добавляем выбранные WB кабинеты в параметры запроса
    // Если не выбрано ни одного кабинета - передаем пустую строку для получения пустых данных
    url.searchParams.set('wb_lk_ids', selectedWbLks.length > 0 ? selectedWbLks.join(',') : '');
    
    // Добавляем дополнительные параметры
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }
    
    return url.toString();
  }, [selectedWbLks]);

  const fetchWithWbLks = useCallback(async (endpoint: string, options?: RequestInit, params?: Record<string, any>) => {
    const url = buildApiUrl(endpoint, params);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }, [buildApiUrl]);

  return {
    selectedWbLks,
    buildApiUrl,
    fetchWithWbLks,
  };
};
