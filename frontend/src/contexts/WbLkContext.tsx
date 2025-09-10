import React, { createContext, useContext, useState, ReactNode } from 'react';

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

interface WbLkContextType {
  selectedWbLks: number[];
  setSelectedWbLks: (wbLks: number[]) => void;
  addWbLk: (wbLkId: number) => void;
  removeWbLk: (wbLkId: number) => void;
  clearWbLks: () => void;
  selectAllWbLks: (allWbLks: WbLk[]) => void;
}

const WbLkContext = createContext<WbLkContextType | undefined>(undefined);

export const useWbLkContext = () => {
  const context = useContext(WbLkContext);
  if (!context) {
    throw new Error('useWbLkContext must be used within a WbLkProvider');
  }
  return context;
};

interface WbLkProviderProps {
  children: ReactNode;
}

export const WbLkProvider: React.FC<WbLkProviderProps> = ({ children }) => {
  const [selectedWbLks, setSelectedWbLks] = useState<number[]>([]);

  const addWbLk = (wbLkId: number) => {
    setSelectedWbLks(prev => 
      prev.includes(wbLkId) ? prev : [...prev, wbLkId]
    );
  };

  const removeWbLk = (wbLkId: number) => {
    setSelectedWbLks(prev => prev.filter(id => id !== wbLkId));
  };

  const clearWbLks = () => {
    setSelectedWbLks([]);
  };

  const selectAllWbLks = (allWbLks: WbLk[]) => {
    setSelectedWbLks(allWbLks.map(wbLk => wbLk.id));
  };

  return (
    <WbLkContext.Provider value={{
      selectedWbLks,
      setSelectedWbLks,
      addWbLk,
      removeWbLk,
      clearWbLks,
      selectAllWbLks
    }}>
      {children}
    </WbLkContext.Provider>
  );
};
