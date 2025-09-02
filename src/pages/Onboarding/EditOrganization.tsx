// pages/EditOrganization.tsx
import { useForm } from 'react-hook-form';
import { useAuthShared } from '@/hooks/useAuthShared';
import axios from 'axios';
import { useUserData } from './hooks/useUserData';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

interface OrganizationFormValues {
  organizationName: string;
  website: string;
}

function EditOrganization() {
  const { user, getAccessTokenSilently } = useAuthShared();
  const { userData, setUserData, loading } = useUserData();

  const form = useForm<OrganizationFormValues>({
    defaultValues: { 
      organizationName: '',
      website: ''
    },
  });

  // Set form values when userData is loaded
  useEffect(() => {
    if (userData?.organization) {
      form.reset({
        organizationName: userData.organization.name,
        website: userData.organization.website
      });
    }
  }, [userData, form]);

  const onSubmit = async (data: OrganizationFormValues) => {
    try {
      const token = await getAccessTokenSilently();
      
      // Update organization data
      await axios.put(
        `${import.meta.env.VITE_API_URL}/auth/user/${user?.sub}/organization`,
        { 
          organizationName: data.organizationName,
          website: data.website 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch updated user data
      const updated = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/user/${user?.sub}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUserData(updated.data);
      alert('Organization updated successfully!');
    } catch (err) {
      console.error('Update failed:', err);
      alert('Update failed. Please try again.');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!userData?.organization) return <div className="p-4">Organization data not available</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Edit Organization</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="organizationName"
            rules={{ 
              required: 'Organization name is required',
              minLength: {
                value: 3,
                message: 'Organization name must be at least 3 characters'
              }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter organization name" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            rules={{
              required: 'Website URL is required',
              pattern: {
                value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                message: 'Please enter a valid website URL'
              }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://yourcompany.com" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default EditOrganization;