// src/components/AppLayout.tsx
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';

export default function AppLayout() {
  const { user } = useAuth0();

  useEffect(() => {
    if (user) {
      // Save user with client info
      const userAgent = navigator.userAgent;
      
      fetch('http://localhost:3000/auth/save-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...user, 
          browser: userAgent,
        }),
      }).catch(error => console.error('Failed to save user:', error));
    }
  }, [user]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}