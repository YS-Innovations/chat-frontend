// src/pages/TeamDashboard.tsx
import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import UserStatusIndicator from './UserStatusIndicator';
import { useSocket } from './SocketContext';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  picture: string;
  auth0Id: string;
}

const TeamDashboard: React.FC = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const { userStatuses } = useSocket();

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/user-status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to fetch team members');
        
        const data = await response.json();
        setTeamMembers(data.map((status: any) => ({
          id: status.userId,
          name: status.user.name,
          email: status.user.email,
          picture: status.user.picture,
          auth0Id: status.user.auth0Id,
        })));
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };

    fetchTeamMembers();
  }, [getAccessTokenSilently]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Team Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {teamMembers.map(member => (
          <div 
            key={member.id}
            className="bg-white rounded-lg shadow-md p-4 flex items-center"
          >
            <UserStatusIndicator
              userId={member.id}
              picture={member.picture}
              name={member.name}
              size="md"
            />
            
            <div className="ml-4">
              <h3 className="font-medium">{member.name}</h3>
              <p className="text-sm text-gray-600">{member.email}</p>
              
              {userStatuses[member.id] && (
                <p className="text-xs mt-1">
                  {userStatuses[member.id].isOnline
                    ? <span className="text-green-600">Online now</span>
                    : userStatuses[member.id].lastSeen
                      ? `Last seen: ${new Date(userStatuses[member.id].lastSeen!).toLocaleTimeString()}`
                      : 'Offline'}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamDashboard;