import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// import axios from 'axios';

const Settings = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  // Settings states
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    issueUpdates: true,
    issueResolution: true
  });
  
  const [displaySettings, setDisplaySettings] = useState({
    darkMode: false,
    compactView: false
  });
  
  const [accountSettings, setAccountSettings] = useState({
    changePassword: false,
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  
  const getAuthToken = () => {
    if (token?.access) {
      return token.access;
    }
    try {
      const tokensStr = localStorage.getItem('tokens');
      if (tokensStr) {
        const tokens = JSON.parse(tokensStr);
        return tokens.access;
      }
    } catch (err) {
      console.error("Failed to parse tokens from localStorage:", err);
    }
    return null;
  };
  
  // Handle notification toggle changes
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle display settings changes
  const handleDisplayChange = (e) => {
    const { name, checked } = e.target;
    setDisplaySettings(prev => ({
      ...prev,
      [name]: checked
    }));
    
    // Apply dark mode if needed
    if (name === 'darkMode') {
      document.documentElement.classList.toggle('dark', checked);
      localStorage.setItem('darkMode', checked ? 'enabled' : 'disabled');
    }
  };
  
  // Handle password fields
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setAccountSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Toggle password change form
  const togglePasswordForm = () => {
    setAccountSettings(prev => ({
      ...prev,
      changePassword: !prev.changePassword,
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
    setError(null);
  };
  
  
  const saveNotificationSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const accessToken = getAuthToken();
      if (!accessToken) {
        throw new Error("Authentication token not found");
      }
      
      // This is where you would call your API
      // Simulating API call success
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSuccessMessage("Notification settings saved successfully!");
    } catch (err) {
      setError(err.message || "Failed to save notification settings");
    } finally {
      setSaving(false);
    }
  };
  
  // Save display settings
  const saveDisplaySettings = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Save to localStorage instead of API
      localStorage.setItem('displaySettings', JSON.stringify(displaySettings));
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSuccessMessage("Display settings saved successfully!");
    } catch (err) {
      setError(err.message || "Failed to save display settings");
    } finally {
      setSaving(false);
    }
  };
  
  // Change password
  const changePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    // Validate passwords
    if (accountSettings.newPassword !== accountSettings.confirmPassword) {
      setError("New passwords don't match");
      setSaving(false);
      return;
    }
    
    if (accountSettings.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      setSaving(false);
      return;
    }
    
    try {
      const accessToken = getAuthToken();
      if (!accessToken) {
        throw new Error("Authentication token not found");
      }
      
      // This would be a real API call in production
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage("Password changed successfully!");
      togglePasswordForm();
    } catch (err) {
      setError(err.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-green-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/student-dashboard')}
            className="mr-4 p-2 rounded-full hover:bg-green-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md mb-6">
            {successMessage}
          </div>
        )}
        
        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Notification Settings</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive email notifications for important updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="emailNotifications"
                  checked={notificationSettings.emailNotifications}
                  onChange={handleNotificationChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Issue Updates</p>
                <p className="text-sm text-gray-500">Get notified when there are updates to your issues</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="issueUpdates"
                  checked={notificationSettings.issueUpdates}
                  onChange={handleNotificationChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Issue Resolution</p>
                <p className="text-sm text-gray-500">Receive notification when an issue is resolved</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="issueResolution"
                  checked={notificationSettings.issueResolution}
                  onChange={handleNotificationChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            <div className="pt-4">
              <button 
                onClick={saveNotificationSettings}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Notification Settings'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Display Settings */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Display Settings</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Dark Mode</p>
                <p className="text-sm text-gray-500">Switch to dark mode for better visibility at night</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="darkMode"
                  checked={displaySettings.darkMode}
                  onChange={handleDisplayChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Compact View</p>
                <p className="text-sm text-gray-500">Show more content on each page with reduced spacing</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="compactView"
                  checked={displaySettings.compactView}
                  onChange={handleDisplayChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            <div className="pt-4">
              <button 
                onClick={saveDisplaySettings}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Display Settings'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Account Settings */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Account Settings</h2>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <button 
                onClick={togglePasswordForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                {accountSettings.changePassword ? 'Cancel' : 'Change Password'}
              </button>
            </div>
            
            {accountSettings.changePassword && (
              <form onSubmit={changePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={accountSettings.oldPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={accountSettings.newPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={accountSettings.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Changing Password...' : 'Change Password'}
                  </button>
                </div>
              </form>
            )}
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button 
                onClick={() => {
                  if (window.confirm("Are you sure you want to log out?")) {
                    logout();
                    navigate('/login');
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
