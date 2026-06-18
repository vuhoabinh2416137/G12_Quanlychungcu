import React, { createContext, useCallback, useMemo, useState } from 'react';
import { clearAuth, getAuth, setAuth } from './authStore.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuthState] = useState(() => getAuth());

  const login = useCallback((authPayload) => {
    const next = {
      token: authPayload.token,
      role: authPayload.role,
      username: authPayload.username,
      fullName: authPayload.fullName,
    };
    setAuth(next);
    setAuthState(next);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setAuthState(null);
  }, []);

  const value = useMemo(() => ({ auth, login, logout }), [auth, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
