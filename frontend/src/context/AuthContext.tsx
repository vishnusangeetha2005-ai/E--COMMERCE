'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/utils/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  clientId?: string;
  storeName?: string;
  logo?: string;
  brandName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  storeUrl: string;
  login: (data: { token: string; data: User }) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL || '';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore auth state
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    // Wire store context from env variable
    if (STORE_URL) {
      localStorage.setItem('storeUrl', STORE_URL);
      // Fetch clientId if not already cached
      if (!localStorage.getItem('clientId')) {
        api.get(`/store/${STORE_URL}/info`)
          .then(res => {
            if (res.data?.data?.clientId) {
              localStorage.setItem('clientId', res.data.data.clientId);
            }
          })
          .catch(() => {});
      }
    }

    setLoading(false);
  }, []);

  const login = (data: { token: string; data: User }) => {
    setToken(data.token);
    setUser(data.data);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.data));
    // Cache clientId from login response (store-aware endpoints return it)
    if (data.data.clientId) {
      localStorage.setItem('clientId', data.data.clientId);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, storeUrl: STORE_URL, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
