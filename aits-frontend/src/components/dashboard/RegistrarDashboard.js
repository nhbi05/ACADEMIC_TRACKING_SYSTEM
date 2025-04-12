import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Alert, AlertDescription } from '../ui/alert';
import { fetchAllIssues, fetchRegistrarData } from '../../redux/actions/registrarActions';
import { logoutUser } from '../../redux/actions/authActions';

const RegistrarDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector(state => state.auth);
  const { 
    data: issues = [], 
    loading: issuesLoading = true, 
    error: issuesError = null 
  } = useSelector(state => state.registrar.issues);
  
  const { 
    totalIssues = 0, 
    pendingIssues = 0, 
    resolvedIssues = 0 
  } = useSelector(state => state.registrar.stats);
  
  useEffect(() => {
    // Fetch issues with stats
    dispatch(fetchAllIssues())
      .catch(err => console.error('Error fetching issues:', err));
    
    // Fetch registrar profile data
    dispatch(fetchRegistrarData())
      .catch(err => console.error('Error fetching registrar data:', err));
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
    { name: 'Dashboard', icon: '🏠', path: '/registrar-dashboard' },
    { name: 'Manage Students', icon: '👥', path: '/manage-students' },
    { name: 'Manage Issues', icon: '📋', path: '/manage-issues' },
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
            <h2 className="text-xl font-semibold text-gray-800">Registrar Dashboard</h2>
            
            <div className="flex items-center">
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
                      "Registrar"
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    Academic Registrar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Dashboard Content */}
        <main className="p-6">
          {issuesError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{issuesError}</AlertDescription>
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
                    {issuesLoading ? '...' : totalIssues}
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
                    {issuesLoading ? '...' : pendingIssues}
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
                    {issuesLoading ? '...' : resolvedIssues}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Issues Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">Academic Issues Overview</h3>
              <a href="/manage-issues" className="text-sm text-green-600 hover:text-green-500">View all</a>
            </div>
            <div className="p-6">
              {issuesLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ) : issues && issues.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3">Name</th>
                        <th scope="col" className="px-4 py-3">Course</th>
                        <th scope="col" className="px-4 py-3">Reg. No</th>
                        <th scope="col" className="px-4 py-3">Assigned To</th>
                        <th scope="col" className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issues.slice(0, 5).map(issue => (
                        <tr key={issue.id} className="border-b hover:bg-gray-100">
                          <td className="px-4 py-3">{issue.first_name}</td>
                          <td className="px-4 py-3">{issue.programme}</td>
                          <td className="px-4 py-3">{issue.registration_no}</td>
                          <td className="px-4 py-3">{issue.assigned_to || 'Unassigned'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              issue.status === 'resolved' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {issue.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                    📄
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-1">No issues found</h3>
                  <p className="text-gray-500">There are currently no academic issues to review</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RegistrarDashboard;