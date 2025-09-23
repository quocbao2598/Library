import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './components/dashboard/Dashboard';
import BooksPage from './components/books/BooksPage';
import MembersPage from './components/members/MembersPage';
import UnauthorizedPage from './components/common/UnauthorizedPage';
import './App.css';

function App() {
  return (
    <ConfigProvider locale={viVN}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/books" element={
              <ProtectedRoute>
                <AppLayout>
                  <BooksPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/members" element={
              <ProtectedRoute requiredRoles={['LIBRARIAN', 'ADMIN']}>
                <AppLayout>
                  <MembersPage />
                </AppLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
