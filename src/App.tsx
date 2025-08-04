import { useAuth0 } from '@auth0/auth0-react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import LoadingSpinner from './components/Loading/LoadingSpinner';
import { GlobalErrorHandler } from './providers/GlobalErrorHandler';
import useBackendHealth from './providers/useBackendHealth';

function App() {
  const { isLoading: authLoading } = useAuth0();
  const { isBackendUp, checking } = useBackendHealth();

  const isLoading = authLoading || checking || !isBackendUp;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <GlobalErrorHandler>
      <AppRoutes /></GlobalErrorHandler>
    </Router>
  );
}

export default App;
