import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { useUserData } from './hooks/useUserData';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface OnboardingFormValues {
  organizationName: string;
  websiteUrl: string;
}

function Onboarding() {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const { userData, setUserData, loading } = useUserData();

  const form = useForm<OnboardingFormValues>({
    defaultValues: { organizationName: '', websiteUrl: '' },
  });

  const onSubmit = async (data: OnboardingFormValues) => {
    try {
      const token = await getAccessTokenSilently();

      // ✅ PATCH request to onboard route
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/auth/onboard`,
        { organizationName: data.organizationName, websiteUrl: data.websiteUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setUserData(res.data);
      navigate('/app');
      window.location.reload();
    } catch (err) {
      console.error('Onboarding failed:', err);
      alert('Error saving organization. Please try again.');
    }
  };

  if (loading) return <div>Loading...</div>;

  if (userData?.hasOnboarded) {
    navigate('/onboarding/edit'); // Optional: redirect to edit if already onboarded
    return null;
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded">
      <h1 className="text-xl font-semibold mb-4">Welcome! Let’s set up your organization</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FormField
            control={form.control}
            name="organizationName"
            rules={{ required: 'Organization name is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Acme Corp" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="websiteUrl"
            rules={{
              required: 'Website URL is required',
              pattern: {
                value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                message: 'Please enter a valid website URL'
              }
            }}
            render={({ field }) => (
              <FormItem className="mb-4">
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
          <Button type="submit" className="mt-4 w-full">
            Save & Continue
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default Onboarding;
