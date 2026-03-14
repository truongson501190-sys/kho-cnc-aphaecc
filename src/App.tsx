import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Index from './pages/Index';
import { UserManagement } from './pages/UserManagement';
import { NhapKho } from './pages/NhapKho';
import { XuatKho } from './pages/XuatKho';
import { ChuyenKho } from './pages/ChuyenKho';
import { XuatDau } from './pages/XuatDau';
import { QuanLyDanhMuc } from './pages/QuanLyDanhMuc';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Main App Component
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/trang-chu"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />

              {/* Admin-only pages */}
              <Route
                path="/user-management"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <UserManagement />
                  </ProtectedRoute>
                }
              />

              {/* Manager (Duyệt) and Admin */}
              <Route
                path="/quan-ly-danh-muc"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <QuanLyDanhMuc />
                  </ProtectedRoute>
                }
              />

              {/* Warehouse-related pages controlled by module permissions */}
              <Route
                path="/nhap-kho"
                element={
                  <ProtectedRoute requiredModule="kho-tong">
                    <NhapKho />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/xuat-kho"
                element={
                  <ProtectedRoute requiredModule="kho-tong">
                    <XuatKho />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chuyen-kho"
                element={
                  <ProtectedRoute requiredModule="kho-tong">
                    <ChuyenKho />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/xuat-dau"
                element={
                  <ProtectedRoute requiredModule="kho-dau">
                    <XuatDau />
                  </ProtectedRoute>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
 
