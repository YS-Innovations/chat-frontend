import React from 'react';
import { useUserStatus } from '../context/UserStatusContext';

export const TeamStatusList: React.FC = () => {
  const { statuses, loading } = useUserStatus();

  if (loading) {
    return <div>Loading team status...</div>;
  }

  const teamMembers = Object.values(statuses);

  if (teamMembers.length === 0) {
    return <div>No team members found.</div>;
  }

  return (
    <div>
      <h4 className="mb-2 font-semibold">Team Status</h4>
      <ul>
        {teamMembers.map(({ userId, isOnline, user }) => (
          <li key={userId} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
            {/* Online indicator */}
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: isOnline ? 'green' : 'gray',
                marginRight: 8,
              }}
              title={isOnline ? 'Online' : 'Offline'}
            />
            {/* User name */}
            <span>{user?.name || 'Unknown User'}</span>
            {/* Optional last seen */}
            {!isOnline && user && statuses[userId]?.lastSeen && (
              <small style={{ marginLeft: 8, color: '#666' }}>
                (Last seen: {new Date(statuses[userId].lastSeen!).toLocaleString()})
              </small>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
