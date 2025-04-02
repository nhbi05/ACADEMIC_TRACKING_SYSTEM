// src/components/dashboard/StudentDashboard.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Alert, AlertDescription } from '../ui/alert';
import { fetchStudentData, fetchIssues } from '../../redux/actions/studentActions';
//import { logout } from '../../redux/actions/authActions';
import { logoutUser } from '../../redux/actions/authActions';

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get data from Redux store
  const { user } = useSelector(state => state.auth);
  const { 
    profileData, 
    loading: profileLoading, 
    error: profileError 
  } = useSelector(state => state.student || {});
  
  const { 
    issues, 
    loading: issuesLoading, 
    error: issuesError 
  } = useSelector(state => state.issues || {});
  
  // Derived stats based on issues
  const statsData = {
    totalIssues: issues?.length || 0,
    resolvedIssues: issues?.filter(issue => issue.status === 'resolved').length || 0,
    pendingIssues: issues?.filter(issue => issue.status !== 'resolved').length || 0
  };
  
  // Loading and error states
  const loading = profileLoading || issuesLoading;
  const error = profileError || issuesError;
  useEffect(() => {
    // Fetch data when component mounts
    dispatch(fetchStudentData()).catch(err => 
      console.error('Error fetching profile data:', err)
    );
    
    dispatch(fetchIssues()).catch(err => 
      console.error('Error fetching issues:', err)
    );
  }, [dispatch]);
  
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  
  const navItems = [
    { name: 'Dashboard', icon: '🏠', path: '/student-dashboard' },
    { name: 'View Issues', icon: '📄', path: '/my-issues' },
    { name: 'Create Issue', icon: '➕', path: '/submit-issue' },
    { name: 'Profile', icon: '👤', path: '/student/profile' },

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
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
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
              {loading ? (
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
              <a href="/student/issues" className="text-sm text-green-600 hover:text-green-500">View all</a>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ) : issues && issues.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {issues.slice(0, 5).map(issue => (
                    <div key={issue.id} className="py-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-800">{issue.title}</h4>
                          <p className="text-sm text-gray-600">{issue.description?.substring(0, 100)}...</p>
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            issue.status === 'resolved' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {issue.status}
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
                    onClick={() => navigate('/student/issues/create')}
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