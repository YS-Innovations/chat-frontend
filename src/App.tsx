import { useAuth0 } from '@auth0/auth0-react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import LoadingSpinner from './components/Loading/LoadingSpinner';
import { GlobalErrorHandler } from './providers/GlobalErrorHandler';

function App() {
  const { isLoading } = useAuth0();

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
