import { useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authApi, userApi, setAuthFunctions, type LoginRequest, type RegisterRequest, type UpdateProfileRequest, type User as ApiUser } from '../lib/api';
import type { User } from '../types';

// Helper para mapear el usuario de la API al tipo local
const mapApiUserToLocal = (apiUser: ApiUser): Partial<User> => {
  const roleMap: Record<string, 'admin' | 'staff' | 'client'> = {
    'ADMIN': 'admin',
    'SUPER_ADMIN': 'admin',
    'STAFF': 'staff',
    'SUPPORT': 'staff',
    'USER': 'client',
    'CLIENT': 'client',
  };
  
  const nameParts = apiUser.name?.split(' ') || [''];
  
  return {
    id: apiUser.id,
    email: apiUser.email,
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    role: roleMap[apiUser.role] || 'client',
    avatar: apiUser.avatar,
    twoFactorEnabled: apiUser.twoFactorEnabled,
    emailVerified: apiUser.emailVerified,
  };
};

export function useAuth() {
  const { 
    user, 
    token: accessToken, 
    refreshToken,
    isAuthenticated,
    isLoading,
    updateUser: setUser, 
    setTokens, 
    logout: storeLogout,
    setLoading 
  } = useAuthStore();

  // Inicializar funciones de auth en api.ts
  setAuthFunctions({
    getToken: () => accessToken,
    getRefresh: () => refreshToken,
    setTokens: (access, refresh) => setTokens(access, refresh),
    logout: storeLogout,
  });

  const login = useCallback(async (data: LoginRequest) => {
    setLoading(true);
    try {
      const response = await authApi.login(data);
      setUser(mapApiUserToLocal(response.data.user));
      setTokens(response.data.accessToken, response.data.refreshToken);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [setUser, setTokens, setLoading]);

  const register = useCallback(async (data: RegisterRequest) => {
    setLoading(true);
    try {
      const response = await authApi.register(data);
      setUser(mapApiUserToLocal(response.data.user));
      setTokens(response.data.accessToken, response.data.refreshToken);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [setUser, setTokens, setLoading]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      storeLogout();
    }
  }, [storeLogout]);

  const fetchCurrentUser = useCallback(async () => {
    if (!accessToken) return null;
    
    setLoading(true);
    try {
      const response = await authApi.me();
      setUser(mapApiUserToLocal(response.data));
      return response.data;
    } catch (error) {
      console.error('Fetch user error:', error);
      storeLogout();
      return null;
    } finally {
      setLoading(false);
    }
  }, [accessToken, setUser, storeLogout, setLoading]);

  const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
    try {
      const response = await userApi.updateProfile(data);
      setUser(mapApiUserToLocal(response.data));
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error };
    }
  }, [setUser]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      await userApi.changePassword(currentPassword, newPassword);
      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error };
    }
  }, []);

  const setup2FA = useCallback(async () => {
    try {
      const response = await authApi.setup2FA();
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Setup 2FA error:', error);
      return { success: false, error };
    }
  }, []);

  const enable2FA = useCallback(async (code: string) => {
    try {
      const response = await authApi.enable2FA(code);
      if (user) {
        setUser({ ...user, twoFactorEnabled: true });
      }
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Enable 2FA error:', error);
      return { success: false, error };
    }
  }, [user, setUser]);

  const disable2FA = useCallback(async (code: string) => {
    try {
      await authApi.disable2FA(code);
      if (user) {
        setUser({ ...user, twoFactorEnabled: false });
      }
      return { success: true };
    } catch (error) {
      console.error('Disable 2FA error:', error);
      return { success: false, error };
    }
  }, [user, setUser]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    fetchCurrentUser,
    updateProfile,
    changePassword,
    setup2FA,
    enable2FA,
    disable2FA,
  };
}
