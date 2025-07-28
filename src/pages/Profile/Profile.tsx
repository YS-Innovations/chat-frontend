// Profile.tsx
import { useAuth0 } from '@auth0/auth0-react';
import useUser from '../../hooks/useUser';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Link } from 'react-router-dom';
import { Loader2, ImagePlus, ImageIcon } from 'lucide-react';
import { useState, useRef } from 'react';
import { Alert, AlertDescription } from '../../components/ui/alert';

export default function Profile() {
  const { user, logout } = useAuth0();
  const { profile, updateProfilePicture, isLoading, error } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      await updateProfilePicture(file);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (isLoading && !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
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
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  {profile?.picture || user?.picture ? (
                    <img 
                      src={profile?.picture || user?.picture} 
                      alt="User" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <button
                  onClick={triggerFileInput}
                  disabled={isUploading}
                  className="absolute -bottom-2 -right-2 bg-primary text-white p-1 rounded-full shadow-md hover:bg-primary/90 transition-colors"
                  aria-label="Change profile picture"
                >
                  <ImagePlus className="h-4 w-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
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
              <Button 
                variant="outline" 
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              >
                Logout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}