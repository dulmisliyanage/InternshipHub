import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Pages
import { LandingPage } from './pages/public/LandingPage';
import { NotFoundPage } from './pages/public/NotFoundPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ChooseAccountTypePage } from './pages/auth/ChooseAccountTypePage';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { CompanyDashboard } from './pages/company/CompanyDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/choose-account-type" element={<ChooseAccountTypePage />} />

          {/* Protected Dashboard Routes (Placeholder wrapper) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/company/dashboard" element={<CompanyDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
