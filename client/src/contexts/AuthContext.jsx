import { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { username, email }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/user', {
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data); // { username, email }
          localStorage.setItem('username', data.username);
        } else {
          setUser(null);
          localStorage.removeItem('username');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setUser(null);
        localStorage.removeItem('username');
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
