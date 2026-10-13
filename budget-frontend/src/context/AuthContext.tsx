'use client';
import { User } from '@/types/DataTypes';
import { createContext, useState } from 'react';


export const AuthContext = createContext<{ currentUser: User | null; setCurrentUser: (currentUser: User) => void }>({
  currentUser: null,
  setCurrentUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};