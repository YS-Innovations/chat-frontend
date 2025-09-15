// Profile.tsx
import { useState } from 'react';
import { useAuthShared } from '@/hooks/useAuthShared';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Pencil, Save, X, Camera } from 'lucide-react';
import { useProfile } from './useProfile';
import { toast } from 'sonner';

export default function Profile() {
  const { user: auth0User, logout } = useAuthShared();
  const {
    profile,
    isLoading,
    isUpdating,
    updateProfile,
    uploadProfilePicture,
  } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    nickname: '',
    phoneNumber: '',
  });

  const handleEditClick = () => {
    if (profile) {
      setEditData({
        name: profile.name || '',
        nickname: profile.nickname || '',
        phoneNumber: profile.phoneNumber || '',
      });
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    try {
      await updateProfile(editData);
      setIsEditing(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validMimeTypes.includes(file.type)) {
        toast.error('Invalid file type', {
          description: 'Only JPEG, PNG, and GIF images are allowed.',
        });
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error('File too large', {
          description: 'Please select an image smaller than 2MB.',
        });
        return;
      }

      uploadProfilePicture(file);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[200px]" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Manage your personal information and profile picture
            </CardDescription>
          </div>
          {!isEditing ? (
            <Button variant="outline" onClick={handleEditClick}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={isUpdating}>
                <Save className="h-4 w-4 mr-2" />
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage 
                  src={profile?.picture || auth0User?.picture} 
                  alt="Profile"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <AvatarFallback className="text-2xl">
                  {getInitials(profile?.name || auth0User?.name || 'U')}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 bg-primary rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                <Camera className="h-4 w-4 text-white" />
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdating}
                />
              </label>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Profile Picture
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG or GIF. Max 2MB.
              </p>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={isUpdating}
                  />
                ) : (
                  <p className="text-sm py-2 px-3 border border-transparent rounded-md">
                    {profile?.name || 'Not set'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <p className="text-sm py-2 px-3 border border-transparent rounded-md">
                  {profile?.email || auth0User?.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed here
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                {isEditing ? (
                  <Input
                    id="nickname"
                    value={editData.nickname}
                    onChange={(e) => handleInputChange('nickname', e.target.value)}
                    disabled={isUpdating}
                  />
                ) : (
                  <p className="text-sm py-2 px-3 border border-transparent rounded-md">
                    {profile?.nickname || 'Not set'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phoneNumber"
                    value={editData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    disabled={isUpdating}
                    placeholder="+1 (555) 123-4567"
                  />
                ) : (
                  <p className="text-sm py-2 px-3 border border-transparent rounded-md">
                    {profile?.phoneNumber || 'Not set'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Account Actions Section */}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold mb-4">Account Actions</h3>
            <Button
              variant="outline"
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}