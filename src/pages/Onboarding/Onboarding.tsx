import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';

interface OnboardingFormValues {
  organizationName: string;
}

function Onboarding() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<OnboardingFormValues>({
    defaultValues: {
      organizationName: '',
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const onSubmit = async (data: OnboardingFormValues) => {
    if (!user) return;

    setSubmitting(true);

    try {
      const token = await getAccessTokenSilently();

      const clientInfo = {
        browser: navigator.userAgent,
        os: navigator.platform,
        ip: 'auto',
        loginTime: new Date().toISOString(),
        deviceType: 'desktop',
      };

      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/save-user`,
        {
          ...user,
          organizationName: data.organizationName,
          clientInfo,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate('/app', { replace: true });
      window.location.reload();
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Failed to save organization. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-4 text-2xl font-semibold text-indigo-700">
          Welcome! Let's set up your organization
        </h2>
        <p className="mb-6 text-gray-600">
          Please enter the name of your organization to get started.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="organizationName"
              rules={{ required: 'Organization name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-indigo-700">Organization Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Your organization name"
                      className="border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500"
                      disabled={submitting}
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Continue'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default Onboarding;
