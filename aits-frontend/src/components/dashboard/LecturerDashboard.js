import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../redux/actions/authActions';
import { fetchAssignedIssues, fetchResolvedIssues, resolveIssue } from '../../redux/actions/LecturerActions';

const LecturerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned' or 'resolved'
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Destructure issues from the Redux state
  const { loading, issues = [], resolvedIssues = [], error } = useSelector(state => state.lecturer || {});
  const { user } = useSelector(state => state.auth || {});

  useEffect(() => {
    console.log("Fetching lecturer issues...");
    dispatch(fetchAssignedIssues());  // Fetch assigned issues
    dispatch(fetchResolvedIssues()); // Fetch resolved issues
  }, [dispatch]);

  useEffect(() => {
    // Log the data we're receiving for debugging
    console.log("Assigned issues:", issues);
    console.log("Resolved issues:", resolvedIssues);
  }, [issues, resolvedIssues]);
  useEffect(() => {
    // Log the data we're receiving for debugging
    console.log("Assigned issues:", issues);
    if (issues.length > 0) {
      console.log("Sample issue object:", issues[0]);
    }
    console.log("Resolved issues:", resolvedIssues);
  }, [issues, resolvedIssues]);
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleResolveIssue = (issueId) => {
    if (window.confirm('Are you sure you want to mark this issue as resolved?')) {
      dispatch(resolveIssue(issueId));
    }
  };

  const handleViewDetails = (issue) => {
    setSelectedIssue(issue);
  };

  const closeDetailsModal = () => {
    setSelectedIssue(null);
  };

  // Filter for assigned issues (case insensitive matching for status)
  const assignedIssues = issues.filter(issue => 
    issue.status && issue.status.toLowerCase() === 'assigned' || 
    issue.status && issue.status.toLowerCase() === 'in_progress'
  );

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-green-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex justify-center items-center h-screen bg-green-50">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    </div>
  );

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
            <li>
              <button 
                onClick={() => setActiveTab('assigned')}
                className={`flex items-center w-full px-6 py-3 text-gray-700 hover:bg-green-100 hover:text-green-700 transition-colors ${activeTab === 'assigned' ? 'bg-green-100 text-green-700' : ''}`}
              >
                <span className="mr-3 text-lg">📄</span>
                Assigned Issues
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('resolved')}
                className={`flex items-center w-full px-6 py-3 text-gray-700 hover:bg-green-100 hover:text-green-700 transition-colors ${activeTab === 'resolved' ? 'bg-green-100 text-green-700' : ''}`}
              >
                <span className="mr-3 text-lg">✅</span>
                Resolved Issues
              </button>
            </li>
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
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Lecturer Dashboard</h2>
            {user && (
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white">
                  {user.first_name && user.last_name ? (
                    `${user.first_name[0]}${user.last_name[0]}`
                  ) : "👤"}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800">
                    {user.first_name && user.last_name ? (
                      `${user.first_name} ${user.last_name}`
                    ) : "Lecturer"}
                  </p>
                  <p className="text-xs text-gray-500">Course Lecturer</p>
                </div>
              </div>
            )}
          </div>
        </header>
        <main className="p-6">
          {/* Dashboard Summary */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700">Assigned Issues</h3>
              <p className="text-2xl font-bold text-green-600">{assignedIssues.length}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700">Resolved Issues</h3>
              <p className="text-2xl font-bold text-blue-600">{resolvedIssues.length}</p>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'assigned' ? (
            <>
              <h3 className="text-lg font-semibold mb-4">Assigned Issues</h3>
              {assignedIssues.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white shadow rounded-lg">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Student No</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Course Code</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Issue Type</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Status</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignedIssues.map(issue => (
                        <tr key={issue.id} className="border-t">
                          <td className="px-4 py-2 text-sm text-gray-700">{issue.student_no || issue.registration_no}</td>
<td className="px-4 py-2 text-sm text-gray-700">{issue.course_unit || issue.course_code || 'N/A'}</td>
<td className="px-4 py-2 text-sm text-gray-700">{issue.category || issue.issue_type || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              issue.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {issue.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            <button 
                              onClick={() => handleViewDetails(issue)} 
                              className="mr-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Details
                            </button>
                            <button 
                              onClick={() => handleResolveIssue(issue.id)} 
                              className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              Resolve
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white p-6 text-center shadow rounded-lg">
                  <div className="text-gray-400 text-4xl mb-3">📄</div>
                  <h4 className="text-lg font-medium text-gray-800 mb-1">No Assigned Issues</h4>
                  <p className="text-gray-500">You don't have any issues assigned to you at the moment.</p>
                </div>
              )}
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-4">Resolved Issues</h3>
              {resolvedIssues.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white shadow rounded-lg">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Student No</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Course Code</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Issue Type</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Resolved Date</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resolvedIssues.map(issue => (
                        <tr key={issue.id} className="border-t">
                          <td className="px-4 py-2 text-sm text-gray-700">{issue.student_no || issue.registration_no}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{issue.course_code}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{issue.issue_type || issue.category}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{issue.resolved_at ? new Date(issue.resolved_at).toLocaleDateString() : 'N/A'}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            <button 
                              onClick={() => handleViewDetails(issue)}
                              className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white p-6 text-center shadow rounded-lg">
                  <div className="text-gray-400 text-4xl mb-3">✅</div>
                  <h4 className="text-lg font-medium text-gray-800 mb-1">No Resolved Issues</h4>
                  <p className="text-gray-500">You haven't resolved any issues yet.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Issue Details Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Issue Details</h2>
              <button onClick={closeDetailsModal} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Student Name</p>
                <p className="font-medium">{`${selectedIssue.first_name || ''} ${selectedIssue.last_name || ''}`}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Student Number</p>
                <p className="font-medium">{selectedIssue.student_no || selectedIssue.registration_no || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Course Code</p>
                <p className="font-medium">{selectedIssue.course_code || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Issue Type</p>
                <p className="font-medium">{selectedIssue.issue_type || selectedIssue.category || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedIssue.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                    selectedIssue.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedIssue.status}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date Submitted</p>
                <p className="font-medium">{selectedIssue.created_at ? new Date(selectedIssue.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">Description</p>
              <p className="bg-gray-50 p-3 rounded">{selectedIssue.description || 'No description provided.'}</p>
            </div>
            
            {selectedIssue.status !== 'resolved' && (
              <div className="flex justify-end">
                <button 
                  onClick={() => {
                    handleResolveIssue(selectedIssue.id);
                    closeDetailsModal();
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Mark as Resolved
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerDashboard;