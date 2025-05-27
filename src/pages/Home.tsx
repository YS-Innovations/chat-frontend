import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { MessageSquare, BarChart2, Bot, Zap, ChevronRight, Check } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"

export default function Home() {
  const { isAuthenticated, loginWithRedirect, logout, user, isLoading } = useAuth0();
  const navigate = useNavigate();
 

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app');
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const handleLogin = () => {
    if (isAuthenticated) {
      navigate('/app');
    } else {
      loginWithRedirect({
        appState: { returnTo: '/app' }
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-indigo-50">
      {/* Header with auth buttons */}
      <header className="absolute w-full px-6 py-4 flex justify-end items-center gap-4 z-50">
        {isAuthenticated ? (
          <>
            <Button asChild>
              <Link to="/app">Go to App</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full focus:outline-none">
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt="User"
                      className="w-10 h-10 rounded-full border-2 border-white shadow-md hover:border-indigo-200 transition-all"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full border-2 border-white shadow-md bg-indigo-500 flex items-center justify-center text-white font-medium">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Button
            onClick={handleLogin}
             className="bg-[#7c3aed] text-white hover:bg-[#6d28d9] transition transform hover:scale-110 hover:shadow-lg"
          >
            Sign In
          </Button>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Unify Your Customer Communications
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10">
            CoConnect brings all your customer conversations into one powerful platform for seamless team collaboration.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              onClick={() => loginWithRedirect()}
            >
              Get Started Free
              <Zap className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-all hover:scale-105"
            >
              <div className="flex items-center">
                Watch Demo
                <ChevronRight className="ml-2 h-5 w-5" />
              </div>
            </Button>
          </div>
        </div>
      </section>



      {/* Logo Cloud */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-400 uppercase text-sm tracking-wider mb-8">TRUSTED BY INNOVATIVE TEAMS</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 hover:opacity-100 transition-opacity">
            {['Microsoft', 'Slack', 'Shopify', 'Airbnb', 'Spotify'].map((logo) => (
              <div key={logo} className="text-2xl font-bold text-gray-700 hover:text-indigo-600 transition-colors">
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm font-medium mb-4">
              Powerful Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Everything You Need in One Platform</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Designed to help your team deliver exceptional customer experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<MessageSquare className="w-8 h-8 text-indigo-600" />}
              title="Unified Inbox"
              description="All customer messages in one place, from email to social media and live chat."
              features={['Multi-channel support', 'Smart routing', 'Priority tagging']}
            />
            <FeatureCard
              icon={<BarChart2 className="w-8 h-8 text-indigo-600" />}
              title="Smart Analytics"
              description="Real-time insights into customer satisfaction and team performance."
              features={['Custom dashboards', 'CSAT tracking', 'Performance reports']}
            />
            <FeatureCard
              icon={<Bot className="w-8 h-8 text-indigo-600" />}
              title="AI Automation"
              description="Automate repetitive tasks and focus on what matters most."
              features={['Auto-responses', 'Sentiment analysis', 'Smart suggestions']}
            />
          </div>
        </div>
      </section>



      {/* Stats Section */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-indigo-100">Happy Customers</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold mb-2">40%</div>
              <div className="text-indigo-100">Faster Response Time</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-indigo-100">Dedicated Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-6 text-[#4c1d95] transition-transform duration-500 hover:scale-105">
            Ready to transform your customer communication?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto text-[#6b7280]">
            Join thousands of businesses providing exceptional customer service with CoConnect.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <Button
              size="lg"
              className="bg-white text-indigo-600 hover:bg-gray-100 shadow-md hover:shadow-lg transition-all hover:scale-110"
              onClick={() => loginWithRedirect()}
            >
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-[#7c3aed] text-white hover:bg-[#6d28d9] transition transform hover:scale-110 hover:shadow-lg"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">CoConnect</span>
              </h3>
              <p className="text-gray-400">The all-in-one customer communication platform for modern teams.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-gray-300">Product</h4>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Integrations', 'Changelog'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center">
                      <ChevronRight className="h-4 w-4 mr-1 text-indigo-400" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-gray-300">Resources</h4>
              <ul className="space-y-3">
                {['Documentation', 'Blog', 'Support', 'Community'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center">
                      <ChevronRight className="h-4 w-4 mr-1 text-indigo-400" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-gray-300">Company</h4>
              <ul className="space-y-3">
                {['About', 'Careers', 'Contact', 'Press'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center">
                      <ChevronRight className="h-4 w-4 mr-1 text-indigo-400" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">© {new Date().getFullYear()} CoConnect. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, features }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  features?: string[];
}) {
  return (
    <Card className="h-full hover:shadow-lg transition-all border border-gray-100 hover:border-indigo-100 group">
      <CardHeader>
        <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
          {icon}
        </div>
        <CardTitle className="text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{description}</p>
        {features && (
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center text-gray-600">
                <Check className="h-4 w-4 text-indigo-500 mr-2" />
                {feature}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}