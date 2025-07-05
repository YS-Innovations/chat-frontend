import React from 'react'
import { Auth0Provider } from '@auth0/auth0-react'
import { PermissionsProvider } from '../context/permissions'
import { UserStatusProvider } from '../context/UserStatusContext'

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      <PermissionsProvider>
        <UserStatusProvider>
          {children}
        </UserStatusProvider>
      </PermissionsProvider>
    </Auth0Provider>
  )
}

export default AppProviders
