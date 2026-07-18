import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api.js';

// 1. Create the Context object
// Context allows us to share state globally without passing props down manually through every level of the component tree.
const AuthContext = createContext(null);

// 2. Create the Provider Component
// This component wraps our app and holds the actual authentication state (user, loading).
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the currently logged-in user profile from the backend
  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/users/profile');
      if (response.data?.success) {
        // Successfully authenticated, store the user object in state
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      // If the token is missing, expired, or invalid, the request returns an error (like 401).
      // In this case, we treat the user as logged out (null).
      setUser(null);
    } finally {
      // Once the API request is completed (success or failure), stop showing loading indicators.
      setLoading(false);
    }
  };

  // Run the fetch check exactly once when the component is first mounted (loaded) on the screen.
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Logout helper clears cookie on backend and resets user locally
  const logout = async () => {
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      setUser(null);
    }
  };

  // Pass the state variables and setters down to the children components
  return (
    <AuthContext.Provider value={{ user, setUser, loading, fetchCurrentUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Custom helper hook to consume the AuthContext in other components.
// Instead of writing `useContext(AuthContext)` in every page, we can just call `useAuth()`.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
