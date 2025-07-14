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

interface UserData {
  organization?: {
    name: string;
  };
  hasOnboarded?: boolean;
}

function Onboarding() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(true);

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

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.sub) return;
      
      try {
        const token = await getAccessTokenSilently();
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/user/${user.sub}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserData(response.data);
        form.reset({ organizationName: response.data.organization?.name || '' });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoadingUserData(false);
      }
    };

    if (user?.sub) {
      fetchUserData();
    }
  }, [user?.sub, getAccessTokenSilently, form]);

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

      // Use PUT for updating existing organization
      if (userData?.hasOnboarded) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/auth/user/${user.sub}/organization`,
          { organizationName: data.organizationName },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // Use POST for new onboarding
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
      }

      // Refresh user data after update
      const updatedResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/user/${user.sub}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserData(updatedResponse.data);

      if (!userData?.hasOnboarded) {
        navigate('/app', { replace: true });
        window.location.reload();
      } else {
        setIsEditMode(false);
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Failed to save organization. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUserData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (userData?.hasOnboarded && !isEditMode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-indigo-50 via-white to-purple-50 px-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-2xl font-semibold text-indigo-700">
            Your Organization
          </h2>
          <div className="mb-6 space-y-4">
            <p className="text-lg font-medium text-gray-700">
              {userData.organization?.name}
            </p>
            <Button
              onClick={() => setIsEditMode(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Edit Organization Name
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-4 text-2xl font-semibold text-indigo-700">
          {userData?.hasOnboarded ? 'Update Organization' : "Welcome! Let's set up your organization"}
        </h2>
        <p className="mb-6 text-gray-600">
          {userData?.hasOnboarded
            ? 'Update your organization name below'
            : 'Please enter the name of your organization to get started.'}
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

            <div className="flex gap-4">
              {userData?.hasOnboarded && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsEditMode(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default Onboarding;