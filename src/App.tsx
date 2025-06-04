// src/App.tsx
import { useAuth0 } from '@auth0/auth0-react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Contacts from './pages/Contacts';
import AppLayout from './components/AppLayout';
import ApplicationPage from './pages/ApplicationPage';
import AllConversations from './pages/AllConversations';
import AcceptInvite from './pages/AcceptInvite';

function ProtectedRoutes() {
  const { isAuthenticated, isLoading } = useAuth0();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <AppLayout /> : <Navigate to="/" state={{ from: location }} replace />;
}

function App() {
  const { isLoading, isAuthenticated } = useAuth0();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/app/*" element={<ProtectedRoutes />}>
          <Route index element={<ApplicationPage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="conversations" element={<AllConversations />} />
        </Route>
        <Route path="*" element={<Navigate to={isAuthenticated ? "/app" : "/"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;