import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  logout: () => {},
  refreshUserData: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user'); 
        console.log('Stored user data:', storedUser); // Debugging log
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          // Verify the session is still valid
          const response = await fetch('http://localhost:3001/api/verify-session', {
            credentials: 'include'
          });
          if (response.ok) {
            setUser(userData);
          } else {
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const refreshUserData = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        const response = await fetch(`http://localhost:3001/api/users/${userData.user_id}`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const latestUserData = await response.json();
          setUser(latestUserData);
          localStorage.setItem('user', JSON.stringify(latestUserData));
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      console.log('Sending login request:', { email, password, role });
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim(),
          password: password.trim(),
          role 
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Fetch complete user data
        const userResponse = await fetch(`http://localhost:3001/api/users/${data.user_id}`, {
          credentials: 'include',
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          return true;
        } else {
          throw new Error('Failed to fetch user data');
        }
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};
