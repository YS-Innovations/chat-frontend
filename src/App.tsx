// App.tsx
import { useAuth0 } from '@auth0/auth0-react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import LoadingSpinner from './components/Loading/LoadingSpinner';
import { GlobalErrorHandler } from './providers/GlobalErrorHandler';
// import useBackendHealth from './providers/useBackendHealth';

function App() {
  const { isLoading: authLoading, 
    // isAuthenticated
   } = useAuth0();
  // const { isBackendUp, checking } = useBackendHealth();

  const isLoading = authLoading 
  // || checking || !isBackendUp
  ;

  if (isLoading) {
    return (
      <div className="app-loading">
        <LoadingSpinner />
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <Router>
      <GlobalErrorHandler>
        <AppRoutes />
      </GlobalErrorHandler>
    </Router>
  );
}

export default App;