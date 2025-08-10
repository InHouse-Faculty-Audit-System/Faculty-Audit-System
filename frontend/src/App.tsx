import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import AdminLoginPage from './components/AdminLoginPage';
import AdminDashboard from './components/AdminDashboard';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // If a user is logged in, show the correct dashboard
  if (user) {
    return user.role === 'admin' ? <AdminDashboard /> : <Dashboard />;
  }

  // If no user is logged in, decide which login page to show
  return showAdminLogin ? (
    <AdminLoginPage onBack={() => setShowAdminLogin(false)} />
  ) : (
    <LoginPage onAdminClick={() => setShowAdminLogin(true)} />
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;