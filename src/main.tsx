// main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { Auth0Provider } from '@auth0/auth0-react'
import './index.css'
import { PermissionsProvider } from './context/PermissionsContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        cacheLocation: 'localstorage',
      }}
      useRefreshTokens={true}
    >
      <PermissionsProvider>
      <App /></PermissionsProvider>
    </Auth0Provider>
  </React.StrictMode>
)