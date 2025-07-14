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
  const [fetchError, setFetchError] = useState<string | null>(null);

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
      setFetchError(null);

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
        setFetchError('Failed to load user data. Please refresh the page.');
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-indigo-100 via-white to-purple-100">
        <div className="text-xl font-semibold text-indigo-700 animate-pulse">
          Loading user data...
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-red-50 px-4">
        <div className="max-w-md rounded-lg bg-red-100 p-6 text-center shadow-md">
          <p className="mb-4 text-red-700 font-semibold">{fetchError}</p>
          <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (userData?.hasOnboarded && !isEditMode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-indigo-100 via-white to-purple-100 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-10 shadow-xl border border-indigo-200">
          <h2 className="mb-6 text-3xl font-extrabold text-indigo-700 tracking-wide">
            Your Organization
          </h2>
          <p className="mb-8 text-lg font-medium text-gray-800">{userData.organization?.name}</p>
          <Button
            onClick={() => setIsEditMode(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition"
          >
            Edit Organization Name
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-indigo-100 via-white to-purple-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-10 shadow-xl border border-indigo-200">
        <h2 className="mb-5 text-3xl font-extrabold text-indigo-700 tracking-tight">
          {userData?.hasOnboarded
            ? 'Update Organization'
            : "Welcome! Let's set up your organization"}
        </h2>
        <p className="mb-8 text-gray-600 text-md leading-relaxed">
          {userData?.hasOnboarded
            ? 'Update your organization name below'
            : 'Please enter the name of your organization to get started.'}
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
            <FormField
              control={form.control}
              name="organizationName"
              rules={{ required: 'Organization name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-indigo-700 font-semibold text-lg">
                    Organization Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Your organization name"
                      className="border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm transition"
                      disabled={submitting}
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage className="text-red-600 mt-1" />
                </FormItem>
              )}
            />

            <div className="flex gap-4 mt-2">
              {userData?.hasOnboarded && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-50 focus:ring-4 focus:ring-indigo-300 transition rounded-md py-3"
                  onClick={() => setIsEditMode(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                className={`flex-1 font-semibold py-3 rounded-md transition focus:ring-4 focus:ring-indigo-300 ${submitting
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white`}
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
