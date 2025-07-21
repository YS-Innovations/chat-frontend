// pages/EditOrganization.tsx
import { useForm } from 'react-hook-form';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { useUserData } from './hooks/useUserData';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface OnboardingFormValues {
  organizationName: string;
}

function EditOrganization() {
  const { user, getAccessTokenSilently } = useAuth0();
  const { userData, setUserData, loading } = useUserData();

  const form = useForm<OnboardingFormValues>({
    defaultValues: { organizationName: userData?.organization?.name || '' },
  });

  const onSubmit = async (data: OnboardingFormValues) => {
    try {
      const token = await getAccessTokenSilently();
      await axios.put(
        `${import.meta.env.VITE_API_URL}/auth/user/${user?.sub}/organization`,
        { organizationName: data.organizationName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/user/${user?.sub}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserData(updated.data);
      alert('Organization name updated.');
    } catch (err) {
      console.error(err);
      alert('Update failed.');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Edit Organization Name</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="organizationName"
            rules={{ required: 'Organization name is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Update</Button>
        </form>
      </Form>
    </div>
  );
}

export default EditOrganization;
