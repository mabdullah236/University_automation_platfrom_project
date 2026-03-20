
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../lib/types';
import { MOCK_USERS } from '../lib/constants';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
    } finally {
        setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    // In a real app, this would be an API call.
    // Here we simulate it with mock data. 'pass' is ignored.
    setLoading(true);
    return new Promise(resolve => {
        setTimeout(() => {
            const foundUser = MOCK_USERS.find(u => u.email === email);
            if (foundUser) {
                setUser(foundUser);
                localStorage.setItem('user', JSON.stringify(foundUser));
                resolve(true);
            } else {
                resolve(false);
            }
            setLoading(false);
        }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // The navigation will be handled by the component calling logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
