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
import { StudentOnboardingPage } from './pages/student/StudentOnboardingPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentProfileEditPage } from './pages/student/StudentProfileEditPage';
import { CompanyDashboard } from './pages/company/CompanyDashboard';
import { CompanyOnboardingPage } from './pages/company/CompanyOnboardingPage';
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

          {/* Role-Protected Dashboard Routes */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/onboarding" element={<StudentOnboardingPage />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />
            <Route path="/student/profile/edit" element={<StudentProfileEditPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['COMPANY']} />}>
            <Route path="/company/dashboard" element={<CompanyDashboard />} />
            <Route path="/company/onboarding" element={<CompanyOnboardingPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
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
