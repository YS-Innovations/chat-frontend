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
import { useState } from 'react';
import { LoaderPinwheel } from 'lucide-react';

interface OnboardingFormValues {
  organizationName: string;
  websiteUrl: string;
}

function Onboarding() {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const { userData, setUserData, loading } = useUserData();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<OnboardingFormValues>({
    defaultValues: { organizationName: '', websiteUrl: '' },
    mode: 'onTouched',
  });

  const onSubmit = async (data: OnboardingFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      const token = await getAccessTokenSilently();

      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/auth/onboard`,
        { organizationName: data.organizationName, websiteUrl: data.websiteUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserData(res.data);
      navigate('/app');
      window.location.reload();
    } catch (err) {
      console.error('Onboarding failed:', err);
      setError('Failed to save organization details. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderPinwheel className="animate-spin h-6 w-6 text-gray-600" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (userData?.hasOnboarded) {
    navigate('/onboarding/edit');
    return null;
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded-md">
      <h1 className="text-xl font-semibold mb-4">
        Welcome! Let’s set up your organization
      </h1>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm border border-red-200">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FormField
            control={form.control}
            name="organizationName"
            rules={{ required: 'Organization name is required' }}
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Organization Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Acme Corp"
                    {...field}
                    autoFocus
                  />
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
                value:
                  /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)*\/?$/,
                message: 'Please enter a valid website URL',
              },
            }}
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Website URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://yourcompany.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full mt-4" disabled={submitting}>
            {submitting && (
              <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
            )}
            {submitting ? 'Saving...' : 'Save & Continue'}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default Onboarding;
