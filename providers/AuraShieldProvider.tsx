import { useState, useEffect, useCallback, useMemo } from "react";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuraShieldContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export const [AuraShieldProvider, useAuraShield] = createContextHook<AuraShieldContextType>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadStoredUser = useCallback(async () => {
    try {
      const [storedUser, token] = await Promise.all([
        AsyncStorage.getItem("aura-shield-user"),
        AsyncStorage.getItem("userToken"),
      ]);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setHasToken(!!token);
    } catch (error) {
      console.error("Error loading stored user:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoredUser();
  }, [loadStoredUser]);

  const login = useCallback(async (userData: User) => {
    try {
      setUser(userData);
      await Promise.all([
        AsyncStorage.setItem("aura-shield-user", JSON.stringify(userData)),
        AsyncStorage.setItem("userToken", "true"),
      ]);
      setHasToken(true);
    } catch (error) {
      console.error("Error storing user:", error);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setUser(null);
      setHasToken(false);
      await Promise.all([
        AsyncStorage.removeItem("aura-shield-user"),
        AsyncStorage.removeItem("userToken"),
      ]);
    } catch (error) {
      console.error("Error removing user:", error);
    }
  }, []);

  return useMemo(() => ({
    user,
    isAuthenticated: !!user || hasToken,
    login,
    logout,
    isLoading,
  }), [user, hasToken, login, logout, isLoading]);
});