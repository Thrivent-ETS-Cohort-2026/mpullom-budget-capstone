'use client';
import { User } from '@/types/DataTypes';
import { createContext, useState } from 'react';

export const AuthContext = createContext<{ 
  currentUser: User | null; 
  setCurrentUser: (currentUser: User | null) => void;
  updateUser: (updatedFields: Partial<User>) => void;
}>({
  currentUser: null,
  setCurrentUser: () => {},
  updateUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const updateUser = (updatedFields: Partial<User>) => {
    setCurrentUser((prevUser) => {
      if (!prevUser) return null;
      return { ...prevUser, ...updatedFields };
    });
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};