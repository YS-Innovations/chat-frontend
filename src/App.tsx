// src/App.tsx
import { useAuth0 } from '@auth0/auth0-react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Contacts from './pages/contacts/contacts.tsx';
import AppLayout from './components/AppLayout';
import ApplicationPage from './pages/ApplicationPage';
import AllConversations from './pages/AllConversations';
import AcceptInvite from './pages/AcceptInvite';
import { PermissionEditPage } from './pages/permissions/permission-edit-page.tsx';
import { PermissionViewPage } from './pages/permissions/permission-view-page.tsx';
import { useEffect, useState, type JSX } from 'react';

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
function AdminOnlyRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, user, isLoading,getAccessTokenSilently } = useAuth0();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (isAuthenticated && user) {
        try {
          const token = await getAccessTokenSilently();
          const response = await fetch(`http://localhost:3000/auth/user/${user.sub}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!response.ok) throw new Error('Failed to fetch user data');
          
          const userData = await response.json();
          setIsAdmin(userData.role === 'ADMIN');
        } catch (error) {
          console.error('Error checking admin status:', error);
        } finally {
          setChecking(false);
        }
      } else {
        setChecking(false);
      }
    };

    checkAdmin();
  }, [isAuthenticated, user]);

  if (isLoading || checking) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
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
       <Route 
          path="/permissions/edit/:userId" 
          element={
            <AdminOnlyRoute>
              <PermissionEditPage />
            </AdminOnlyRoute>
          } 
        />
        <Route 
          path="/permissions/view/:userId" 
          element={
            <AdminOnlyRoute>
              <PermissionViewPage />
            </AdminOnlyRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;