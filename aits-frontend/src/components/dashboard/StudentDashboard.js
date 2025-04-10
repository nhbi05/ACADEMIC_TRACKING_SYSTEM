import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const StudentDashboard = () => {
const navigate = useNavigate();
const { user, logout } = useAuth();

const [profileData, setProfileData] = useState(null);
const [issues, setIssues] = useState([]);
const [profileLoading, setProfileLoading] = useState(true);
const [issuesLoading, setIssuesLoading] = useState(true);
const [error, setError] = useState(null);

// Get token helper - standardized to use localStorage directly
const getAuthToken = useCallback(() => {
// Get access token directly from localStorage
const accessToken = localStorage.getItem('access');
if (accessToken) {
  return accessToken;
}
return null;
}, []);

// Fetch student profile data
useEffect(() => {
const fetchStudentData = async () => {
  const accessToken = getAuthToken();
  
  if (!accessToken) {
    setError("Authentication token not found. Please log in again.");
    setProfileLoading(false);
    return;
  }
  
  try {
    const response = await axios.get('http://localhost:8000/api/student/profile/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    setProfileData(response.data);
  } catch (err) {
    console.error("Error fetching profile data:", err);
    
    // Check if error is due to expired token
    if (err.response && err.response.status === 401) {
      setError("Your session has expired. Please log in again.");
      // Optional: redirect to login
      // navigate('/login');
    } else {
      setError("Failed to load your profile. Please try again.");
    }
  } finally {
    setProfileLoading(false);
  }
};

fetchStudentData();
}, [getAuthToken, navigate]);

// Fetch issues
useEffect(() => {
const fetchIssues = async () => {
  const accessToken = getAuthToken();
  
  if (!accessToken) {
    setIssuesLoading(false);
    return;
  }
  
  try {
    const response = await axios.get('http://localhost:8000/api/my-issues/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    setIssues(response.data);
  } catch (err) {
    console.error("Error fetching issues:", err);
    // Don't set error here to avoid duplicate error messages
    // if profile fetch already failed
    if (!error && err.response && err.response.status === 401) {
      setError("Your session has expired. Please log in again.");
    }
  } finally {
    setIssuesLoading(false);
  }
};

fetchIssues();
}, [getAuthToken, error]);

// Derived stats based on issues
const statsData = {
totalIssues: issues?.length || 0,
resolvedIssues: issues?.filter(issue => issue.status === 'resolved').length || 0,
pendingIssues: issues?.filter(issue => issue.status !== 'resolved').length || 0
};

// Loading and error states
const loading = profileLoading || issuesLoading;

const handleLogout = () => {
if (window.confirm("Are you sure you want to log out?")) {
  // Clear tokens from localStorage directly
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('user');
  // Also use the logout function from context
  logout();
  navigate('/login');
}
};

const navItems = [
{ name: 'Dashboard', icon: '🏠', path: '/student-dashboard' },
{ name: 'View Issues', icon: '📄', path: '/my-issues' },
{ name: 'Create Issue', icon: '➕', path: '/submit-issue' },
];

  return (
    <div className="flex h-screen bg-green-50">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-green-700">AITS</h1>
          <p className="text-xs text-gray-600">Academic Issue Tracking System</p>
        </div>
        
        <nav className="mt-6">
          <ul>
            {navItems.map((item, index) => (
              <li key={index}>
                <button 
                  onClick={() => navigate(item.path)}
                  className="flex items-center w-full px-6 py-3 text-gray-700 hover:bg-green-100 hover:text-green-700 transition-colors"
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </button>
              </li>
            ))}
            
            <li>
              <button 
                onClick={handleLogout}
                className="flex items-center w-full px-6 py-3 text-gray-700 hover:bg-red-100 hover:text-red-700 transition-colors"
              >
                <span className="mr-3 text-lg">🚪</span>
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header with profile info */}
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
            
            <div className="flex items-center">
              {loading ? (
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
              ) : (
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white">
                    {user && user.first_name && user.last_name ? (
                      `${user.first_name[0]}${user.last_name[0]}`
                    ) : (
                      "👤"
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-800">
                      {user && user.first_name && user.last_name ? (
                        `${user.first_name} ${user.last_name}`
                      ) : (
                        "Student"
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {profileData?.student_no || "Loading..."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Main Dashboard Content */}
        <main className="p-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
              {error}
              {error.includes("log in again") && (
                <button 
                  onClick={() => navigate('/login')}
                  className="ml-2 text-red-700 underline"
                >
                  Go to Login
                </button>
              )}
            </div>
          )}
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 text-xl">
                  ⚠️
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Issues</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {loading ? '...' : statsData.totalIssues}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600 text-xl">
                  ✅
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Resolved Issues</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {loading ? '...' : statsData.resolvedIssues}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 text-xl">
                  ⏱️
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Issues</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {loading ? '...' : statsData.pendingIssues}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">Profile Information</h3>
            </div>
            <div className="p-6">
              {profileLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Student Number</p>
                    <p className="text-base text-gray-900">{profileData?.student_no || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Programme</p>
                    <p className="text-base text-gray-900">{profileData?.programme || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Registration Number</p>
                    <p className="text-base text-gray-900">{profileData?.registration_no || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-base text-gray-900">{user?.email || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Recent Issues */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">Recent Issues</h3>
              <button 
                onClick={() => navigate('/my-issues')}
                className="text-sm text-green-600 hover:text-green-500"
              >
                View all
              </button>
            </div>
            <div className="p-6">
              {issuesLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ) : issues && issues.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {issues.slice(0, 3).map(issue => (
                    <div key={issue.id} className="py-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-800">Issue #{issue.id} - {issue.course_unit}</h4>
                          <p className="text-sm text-gray-600">
                            {issue.description?.substring(0, 100)}
                            {issue.description?.length > 100 ? '...' : ''}
                          </p>
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            issue.status === 'resolved' 
                              ? 'bg-green-100 text-green-800' 
                              : issue.status === 'in progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {issue.status || 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                    📄
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-1">No issues yet</h3>
                  <p className="text-gray-500">Create your first issue to get started</p>
                  <button
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    onClick={() => navigate('/submit-issue')}
                  >
                    Create Issue
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;