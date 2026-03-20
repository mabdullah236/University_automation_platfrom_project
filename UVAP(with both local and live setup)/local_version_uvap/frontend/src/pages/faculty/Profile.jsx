import React, { useState, useEffect } from 'react';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [settingsForm, setSettingsForm] = useState({
    phone: '',
    oldPassword: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/v1/faculty/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setSettingsForm(prev => ({ ...prev, phone: data.data.phone || '' }));
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (settingsForm.password && settingsForm.password !== settingsForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/v1/faculty/me/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: settingsForm.phone,
          oldPassword: settingsForm.oldPassword,
          password: settingsForm.password
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        setSettingsForm(prev => ({ ...prev, oldPassword: '', password: '', confirmPassword: '' }));
        fetchProfile(); // Refresh data
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error' });
    }
  };

  if (loading) return <div className="p-8 text-center dark:text-white">Loading profile...</div>;
  if (!profile) return <div className="p-8 text-center text-red-500">Profile not found.</div>;

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="w-32 h-32 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4 overflow-hidden">
               <img 
                  src={`https://ui-avatars.com/api/?name=${profile.name}&background=random&size=128`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
            <p className="text-blue-600 font-medium mb-2">{profile.designation}</p>
            <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-full">
              {profile.department}
            </span>
            
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 text-left">
              <div className="mb-3">
                <label className="text-xs text-gray-500 uppercase font-semibold">Employee ID</label>
                <p className="text-gray-800 dark:text-gray-200 font-mono">{profile.employeeId}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold">Joined</label>
                <p className="text-gray-800 dark:text-gray-200">{new Date(profile.joiningDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tabs & Details */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                className={`px-6 py-4 font-medium text-sm focus:outline-none transition-colors ${
                  activeTab === 'about'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-gray-700 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('about')}
              >
                About
              </button>
              <button
                className={`px-6 py-4 font-medium text-sm focus:outline-none transition-colors ${
                  activeTab === 'settings'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-gray-700 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'about' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Email</label>
                        <p className="text-gray-800 dark:text-gray-200">{profile.email}</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Phone</label>
                        <p className="text-gray-800 dark:text-gray-200">{profile.phone || 'Not Provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Professional Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Specialization</label>
                        <p className="text-gray-800 dark:text-gray-200">{profile.specialization || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Qualifications</label>
                        {profile.qualifications && profile.qualifications.length > 0 ? (
                          <ul className="mt-2 space-y-2">
                            {profile.qualifications.map((qual, index) => (
                              <li key={index} className="flex items-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                                {qual.degree} from {qual.institution} ({qual.year})
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 italic mt-1">No qualifications listed.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <form onSubmit={handleSettingsSubmit} className="max-w-lg">
                  {message.text && (
                    <div
                      className={`mb-6 p-4 rounded-lg border ${
                        message.type === 'success'
                          ? 'bg-green-50 border-green-100 text-green-700 dark:bg-green-900 dark:border-green-800 dark:text-green-200'
                          : 'bg-red-50 border-red-100 text-red-700 dark:bg-red-900 dark:border-red-800 dark:text-red-200'
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                    <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-4">Change Password</h4>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        value={settingsForm.oldPassword}
                        onChange={(e) => setSettingsForm({ ...settingsForm, oldPassword: e.target.value })}
                        placeholder="Required to set new password"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        value={settingsForm.password}
                        onChange={(e) => setSettingsForm({ ...settingsForm, password: e.target.value })}
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        value={settingsForm.confirmPassword}
                        onChange={(e) => setSettingsForm({ ...settingsForm, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm w-full md:w-auto"
                  >
                    Save Changes
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
