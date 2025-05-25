import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Contacts from './pages/Contacts';

function App() {
  const { user, isLoading, loginWithRedirect, logout, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    name: ''
  });

  useEffect(() => {
    if (user) {
      const userAgent = navigator.userAgent;
      
      // Save user on login
      fetch('http://localhost:3000/auth/save-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...user, 
          browser: userAgent,
        }),
      })
      .then(() => fetchUserProfile())
      .catch((error) => console.error('Failed to save user:', error));
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`http://localhost:3000/auth/user/${user?.sub}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setProfile(data);
      setFormData({
        nickname: data.nickname || '',
        name: data.name || ''
      });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`http://localhost:3000/auth/user/${user?.sub}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h2>Please sign in</h2>
        <button
          onClick={() => loginWithRedirect()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Sign In
        </button>
      </div>
    );
  }

  const ProfilePage = () => (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Welcome, {profile?.name || user?.name}</h2>
      
      {isEditing ? (
        <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Nickname:</label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleUpdateProfile}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Name:</strong> {profile?.name || 'Not set'}</p>
          <p><strong>Nickname:</strong> {profile?.nickname || 'Not set'}</p>
          <p><strong>Last Login:</strong> {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Unknown'}</p>
          <p><strong>Browser:</strong> {profile?.browser || 'Unknown'}</p>
          
          <button
            onClick={() => setIsEditing(true)}
            style={{
              marginTop: '15px',
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Edit Profile
          </button>
        </div>
      )}

      <button
        onClick={() => logout({ returnTo: window.location.origin })}
        style={{
          padding: '10px 20px',
          backgroundColor: '#ff5733',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Logout
      </button>
    </div>
  );

  return (
    <Router>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        {isAuthenticated && (
          <nav style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
            <Link to="/">Home</Link>
            <Link to="/contacts">Contacts</Link>
          </nav>
        )}
        
        <Routes>
          <Route path="/" element={<ProfilePage />} />
          <Route path="/contacts" element={<Contacts />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;