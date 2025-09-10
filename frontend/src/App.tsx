// marketplace/frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { user, login, register, logout, refreshUserProfile } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Публичные маршруты */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLogin={login} />
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register onRegister={register} />
            )
          }
        />

        {/* Защищенные маршруты */}
        <Route
          path="/dashboard/*"
          element={
            user ? (
              <Dashboard user={user} onLogout={logout} onUserUpdate={refreshUserProfile} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Перенаправление корня */}
        <Route
          path="/"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />

        {/* 404 страница */}
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
};

export default App;