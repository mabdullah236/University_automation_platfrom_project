import React, { useState, useEffect } from 'react';
import { FaUser, FaCog, FaLock } from 'react-icons/fa';

import ConfirmationModal from '../../components/ConfirmationModal';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile State
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    cnic: '',
    address: ''
  });

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    currentSemester: '',
    admissionsOpen: true,
    universityName: '',
    activeSession: 'Fall',
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
    isDanger: false
  });

  // Fetch Data on Mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch Settings
      const settingsRes = await fetch('http://localhost:5001/api/v1/settings', { headers });
      const settingsData = await settingsRes.json();
      if (settingsData.success) setGeneralSettings(settingsData.data);

      // Fetch Profile
      const profileRes = await fetch('http://localhost:5001/api/v1/settings/profile', { headers });
      const profileDataRes = await profileRes.json();
      if (profileDataRes.success) setProfileData(profileDataRes.data);

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/v1/settings/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        setProfileData(data.data);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error' });
    }
  };

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/v1/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(generalSettings),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'System settings updated successfully' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update settings' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error' });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/v1/settings/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully' });
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to change password' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error' });
    }
  };

  const openSessionSwitchModal = (targetSession) => {
    const isFall = targetSession === 'Fall';
    setModalConfig({
      title: `Switch to ${targetSession.toUpperCase()} Session?`,
      message: isFall 
        ? "This will set Semesters 1, 3, 5, 7 as Active. Are you sure you want to proceed?"
        : "This will set Semesters 2, 4, 6, 8 as Active. Are you sure you want to proceed?",
      isDanger: false,
      onConfirm: () => {
        setGeneralSettings(prev => ({ ...prev, activeSession: targetSession }));
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  if (loading) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
      <p className="text-gray-600 mb-8">Manage your profile and system configurations.</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs Header */}
        <div className="flex border-b border-gray-200">
          <button
            className={`px-6 py-4 font-medium text-sm focus:outline-none transition-colors flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser /> My Profile
          </button>
          <button
            className={`px-6 py-4 font-medium text-sm focus:outline-none transition-colors flex items-center gap-2 ${
              activeTab === 'general'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('general')}
          >
            <FaCog /> System Configuration
          </button>
          <button
            className={`px-6 py-4 font-medium text-sm focus:outline-none transition-colors flex items-center gap-2 ${
              activeTab === 'password'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('password')}
          >
            <FaLock /> Security
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-100 text-green-700'
                  : 'bg-red-50 border-red-100 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Tab 1: My Profile */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email (Read-Only)</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    value={profileData.email}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CNIC</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={profileData.cnic}
                    onChange={(e) => setProfileData({ ...profileData, cnic: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Save Profile Changes
              </button>
            </form>
          )}

          {/* Tab 2: System Configuration */}
          {activeTab === 'general' && (
            <form onSubmit={handleGeneralSubmit} className="max-w-lg">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">University Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={generalSettings.universityName}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, universityName: e.target.value })
                  }
                />
              </div>

              {/* Session Control */}
              <div className="mb-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-900 mb-2">Academic Session Control</h4>
                <p className="text-sm text-blue-700 mb-4">
                  Current Session: <strong>{generalSettings.activeSession || 'Fall'}</strong>
                  <br />
                  Active Semesters: {generalSettings.activeSession === 'Spring' ? '2, 4, 6, 8' : '1, 3, 5, 7'}
                </p>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => openSessionSwitchModal('Fall')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      (generalSettings.activeSession || 'Fall') === 'Fall'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Switch to Fall
                  </button>
                  <button
                    type="button"
                    onClick={() => openSessionSwitchModal('Spring')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      generalSettings.activeSession === 'Spring'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Switch to Spring
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Semester</label>
                <input
                  type="text"
                  placeholder="e.g. Fall 2025"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={generalSettings.currentSemester}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, currentSemester: e.target.value })
                  }
                />
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div>
                    <h4 className="font-medium text-gray-900">Admissions Status</h4>
                    <p className="text-sm text-gray-500">
                      {generalSettings.admissionsOpen ? 'Admissions are currently OPEN' : 'Admissions are currently CLOSED'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={generalSettings.admissionsOpen}
                      onChange={(e) =>
                        setGeneralSettings({ ...generalSettings, admissionsOpen: e.target.checked })
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Save System Settings
              </button>
            </form>
          )}

          {/* Tab 3: Security */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="max-w-lg">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, oldPassword: e.target.value })
                  }
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Update Password
              </button>
            </form>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        isDanger={modalConfig.isDanger}
      />
    </div>
  );
};

export default Settings;
