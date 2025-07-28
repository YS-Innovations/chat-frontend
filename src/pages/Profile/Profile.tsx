// Profile.tsx
import { useAuth0 } from '@auth0/auth0-react';
import useUser from '../../hooks/useUser';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Profile() {
  const { user, logout } = useAuth0();
  const { profile, updateProfile, isLoading } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    name: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        nickname: profile.nickname || '',
        name: profile.name || ''
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Profile Information</CardTitle>
            <Button asChild variant="outline">
              <Link to="/app">Back to App</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Name</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block mb-1">Nickname</label>
                <Input
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleUpdateProfile}>Save</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img 
                  src={user?.picture || `https://ui-avatars.com/api/?name=${user?.name || 'user'}&background=random`} 
                  alt="User" 
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="text-xl font-semibold">
                    {profile?.name || user?.name || 'User'}
                  </h3>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p><span className="font-medium">Nickname:</span> {profile?.nickname || 'Not set'}</p>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                <Button 
                  variant="outline" 
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                >
                  Logout
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}