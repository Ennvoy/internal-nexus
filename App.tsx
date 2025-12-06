import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/authService';
import { ConfigProvider } from './services/configService';
import { UserRole } from './types';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { FeatureLibrary } from './pages/FeatureLibrary';
import { PartnerLinks } from './pages/PartnerLinks';
import { ManageUsers } from './pages/admin/ManageUsers';
import { ManageFeatures } from './pages/admin/ManageFeatures';
import { ManageLinks } from './pages/admin/ManageLinks';
import { Profile } from './pages/Profile';

// Protected Route Wrapper
const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: UserRole[] }) => {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasPermission(allowedRoles)) {
    return <Navigate to="/" replace />; // Redirect to dashboard if unauthorized
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ConfigProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Public/Protected Routes wrapped in Layout */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/features" element={<FeatureLibrary />} />
              <Route path="/links" element={<PartnerLinks />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Admin Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/features" element={<ManageFeatures />} />
              <Route path="/admin/links" element={<ManageLinks />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
