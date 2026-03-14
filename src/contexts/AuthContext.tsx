import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, ADMIN_PERMISSIONS, DEFAULT_PERMISSIONS } from '@/types/user';

interface AuthContextType {
  currentUser: User | null;
  user: User | null;
  login: (msnv: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
  canApprove: () => boolean;
  isAuthenticated: boolean;
  refreshUserData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Note: demo/admin seeding removed to allow full user management (admin can be deleted).

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // OFFICIAL ADMIN (seeded) - tạo khi chưa có
  const OFFICIAL_ADMIN: User = {
    msnv: '1118',
    fullName: 'Quản trị viên hệ thống',
    department: 'Quản trị',
    position: 'Quản trị viên',
    role: 'Admin',
    status: 'active',
    permissions: ADMIN_PERMISSIONS,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const OFFICIAL_USER_RECORD = {
    id: 'seed-1118',
    msnv: '1118',
    fullName: 'Quản trị viên hệ thống',
    department: 'Quản trị',
    position: 'Quản trị viên',
    role: 'Admin',
    status: true,
    passwordHash: btoa('123456'),
    createdAt: new Date().toISOString(),
    isProtected: true
  };

  // Đồng bộ dữ liệu giữa login và user management
  const syncUserData = () => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const existingUserRecords = JSON.parse(localStorage.getItem('userRecords') || '[]');
      
      // Ensure official admin exists (seed on demand)
      const hasAdmin = existingUsers.find((u: User) => u.msnv === OFFICIAL_ADMIN.msnv);
      if (!hasAdmin) {
        existingUsers.unshift(OFFICIAL_ADMIN);
      }

      const hasAdminRecord = existingUserRecords.find((r: any) => r.msnv === OFFICIAL_USER_RECORD.msnv);
      if (!hasAdminRecord) {
        existingUserRecords.unshift(OFFICIAL_USER_RECORD);
      }
      
      // Đồng bộ dữ liệu giữa users và userRecords (no special protected accounts)
      existingUsers.forEach((user: User) => {
        const record = existingUserRecords.find((r: any) => r.msnv === user.msnv);
        if (record) {
          // Cập nhật thông tin từ user sang userRecord
          record.fullName = user.fullName;
          record.department = user.department;
          record.position = user.position;
          record.role = user.role;
          record.status = user.status === 'active';
        } else {
          // Tạo userRecord mới nếu chưa có
          const newRecord = {
            id: Date.now().toString(),
            msnv: user.msnv,
            fullName: user.fullName,
            department: user.department,
            position: user.position,
            role: user.role,
            status: user.status === 'active',
            passwordHash: btoa('123456'), // Default password
            createdAt: user.createdAt
          };
          existingUserRecords.push(newRecord);
        }
      });
      
      // Xóa userRecords không có user tương ứng
      const syncedUserRecords = existingUserRecords.filter((record: any) => {
        return existingUsers.find((u: User) => u.msnv === record.msnv);
      });
      
      localStorage.setItem('users', JSON.stringify(existingUsers));
      localStorage.setItem('userRecords', JSON.stringify(syncedUserRecords));
      
      console.log('✅ User data synchronized');
      
    } catch (error) {
      console.error('❌ Error syncing user data:', error);
    }
  };

  const normalizeUser = (u: any): User => {
    try {
      u.name = u.fullName ?? u.name;
      u.hoTen = u.fullName ?? u.hoTen;
      u.username = u.msnv ?? u.username;
      u.chucDanh = u.position ?? u.chucDanh;
      u.boPhan = u.department ?? u.boPhan;
      // map role to a legacy vaiTro string when possible
      if (u.role) {
        const r = String(u.role).toLowerCase();
        if (r === 'admin') u.vaiTro = 'admin';
        else if (r === 'duyệt' || r === 'duyet') u.vaiTro = 'manager';
        else u.vaiTro = 'user';
      }
      u.trangThai = u.status ?? u.trangThai;
    } catch (err) {
      // noop
    }
    return u as User;
  };

  // Force reset and sync data on every app load
  useEffect(() => {
    const initializeData = () => {
      console.log('🔄 INITIALIZING USER SYSTEM...');
      
      syncUserData();
      checkExistingSession();
    };

    initializeData();
  }, []);

  const checkExistingSession = () => {
    try {
      const savedSession = localStorage.getItem('currentUserSession');
      const sessionExpiry = localStorage.getItem('sessionExpiry');
      
      if (savedSession && sessionExpiry) {
        const expiryTime = parseInt(sessionExpiry);
        const currentTime = Date.now();
        
        if (currentTime < expiryTime) {
          const raw = JSON.parse(savedSession);
          console.log('🔄 Restored session for:', raw.fullName);
          const user = normalizeUser(raw);
          setCurrentUser(user);
        } else {
          console.log('⏰ Session expired, clearing...');
          clearSession();
        }
      }
    } catch (error) {
      console.error('❌ Error checking session:', error);
      clearSession();
    } finally {
      setIsLoading(false);
    }
  };

  const clearSession = () => {
    localStorage.removeItem('currentUserSession');
    localStorage.removeItem('sessionExpiry');
  };

  const refreshUserData = () => {
    if (currentUser) {
      // Refresh current user data from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUser = users.find((u: User) => u.msnv === currentUser.msnv);
      if (updatedUser) {
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUserSession', JSON.stringify(updatedUser));
      }
    }
    syncUserData();
  };

  import { supabase } from "@/lib/supabase";

const login = async (msnv: string, password: string) => {

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("MSNV", msnv)
    .eq("password", password)
    .single();

  if (error || !data) {
    return false;
  }

  localStorage.setItem("user", JSON.stringify(data));

  return true;
};
    try {
      console.log('🔐 LOGIN ATTEMPT:', { msnv, password });
      
      // Đồng bộ dữ liệu trước khi login
      syncUserData();
      
      // Get fresh data from localStorage
      const userRecords = JSON.parse(localStorage.getItem('userRecords') || '[]');
      console.log('📋 Available userRecords:', userRecords.map((u: any) => ({ msnv: u.msnv, status: u.status })));
      
      // Find user by MSNV
      const foundUser = userRecords.find((u: any) => u.msnv === msnv);
      console.log('👤 Found user:', foundUser ? { msnv: foundUser.msnv, status: foundUser.status } : 'NOT FOUND');
      
      if (!foundUser) {
        console.log('❌ User not found');
        return false;
      }
      
      // Check if user is active
      if (!foundUser.status) {
        console.log('🔒 User is locked');
        return false;
      }
      
      // Check password
      const expectedPassword = atob(foundUser.passwordHash);
      console.log('🔑 Password check:', { provided: password, expected: expectedPassword, match: password === expectedPassword });
      
      if (password !== expectedPassword) {
        console.log('❌ Wrong password');
        return false;
      }
      
      // Get full user data
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const fullUser = users.find((u: User) => u.msnv === msnv);
      
      if (!fullUser) {
        console.log('❌ Full user data not found');
        return false;
      }
      
      // Update last login
      fullUser.updatedAt = new Date().toISOString();
      
      // Save updated user data
      const updatedUsers = users.map((u: User) => u.msnv === msnv ? fullUser : u);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      const normalized = normalizeUser(fullUser);
      setCurrentUser(normalized);
      
      // Create session
      const sessionDuration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
      const sessionExpiry = Date.now() + sessionDuration;
      
      localStorage.setItem('currentUserSession', JSON.stringify(fullUser));
      localStorage.setItem('sessionExpiry', sessionExpiry.toString());
      
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberLogin', 'true');
        localStorage.setItem('rememberedMsnv', msnv);
      } else {
        localStorage.removeItem('rememberLogin');
        localStorage.removeItem('rememberedMsnv');
      }
      
      console.log('✅ LOGIN SUCCESSFUL:', fullUser.fullName);
      return true;
      
    } catch (error) {
      console.error('💥 LOGIN ERROR:', error);
      return false;
    }
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    setCurrentUser(null);
    clearSession();
    
    const rememberLogin = localStorage.getItem('rememberLogin') === 'true';
    if (!rememberLogin) {
      localStorage.removeItem('rememberedMsnv');
      localStorage.removeItem('rememberLogin');
    }
  };

  const isAdmin = (): boolean => {
    return currentUser?.role === 'Admin';
  };

  const canApprove = (): boolean => {
    return currentUser?.role === 'Admin' || currentUser?.role === 'Duyệt';
  };

  const isAuthenticated = currentUser !== null;

  const value: AuthContextType = {
    currentUser,
    user: currentUser,
    login,
    logout,
    isAdmin,
    canApprove,
    isAuthenticated,
    refreshUserData
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang khởi tạo hệ thống...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}