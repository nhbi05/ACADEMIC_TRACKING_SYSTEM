import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../redux/actions/authActions';
import { fetchAssignedIssues, fetchResolvedIssues, resolveIssue } from '../../redux/actions/LecturerActions';

const LecturerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Add the missing useState variables
  const [activeTab, setActiveTab] = useState('assigned');
  const [selectedIssue, setSelectedIssue] = useState(null);
  
  // Get user from Redux state
  const { user } = useSelector(state => state.auth || { user: null });
  
  // Log the entire lecturer state for debugging
  const lecturerState = useSelector(state => state.lecturer);
  console.log('Full lecturer state:', lecturerState);
  
  // Destructure issues from the Redux state
  const { loading, issues, resolvedIssues, error } = useSelector(state => {
    return state.lecturer || {
      loading: false, issues: [], resolvedIssues: [], error: null
    }
  });

  // Log the extracted data for debugging
  console.log('Issues from state:', issues);
  console.log('Resolved issues from state:', resolvedIssues);

  useEffect(() => {
    console.log("Fetching lecturer issues...");
    dispatch(fetchAssignedIssues())
      .then(response => console.log("Fetch assigned success:", response))
      .catch(err => console.error("Fetch assigned error:", err));
    
    dispatch(fetchResolvedIssues())
      .then(response => console.log("Fetch resolved success:", response))
      .catch(err => console.error("Fetch resolved error:", err));
  }, [dispatch]);

  const handleResolve = async (issueId) => {
    try {
      console.log('Attempting to resolve issue ID:', issueId);
      await dispatch(resolveIssue(issueId));
      console.log('Issue resolved successfully');
      return true; // Return true on success for the resolve button
    } catch (error) {
      console.error('Failed to resolve Issue', { issueId, error });
      return false; // Return false on error for the resolve button
    }
  }
  
  // Add the missing functions
  const handleResolveIssue = (issueId) => {
    return handleResolve(issueId);
  };
  
  const closeDetailsModal = () => {
    setSelectedIssue(null);
  };
  
  // Function to open the details modal
  const openDetailsModal = (issue) => {
    console.log('Opening details for issue:', issue);
    setSelectedIssue(issue);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  
  // Handle empty issues array
  const hasAssignedIssues = issues && issues.length > 0;
  const hasResolvedIssues = resolvedIssues && resolvedIssues.length > 0;

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
              <p className="text-2xl font-bold text-green-600">{issues ? issues.length : 0}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700">Resolved Issues</h3>
              <p className="text-2xl font-bold text-blue-600">{resolvedIssues ? resolvedIssues.length : 0}</p>
            </div>
          </div>

          {/* Display the appropriate content based on active tab */}
          {activeTab === 'assigned' ? (
            <>
              {/* Assigned Issues Table */}
              <h3 className="text-lg font-semibold mb-4">Assigned Issues</h3>
              {!hasAssignedIssues ? (
                <p className="text-center py-4 bg-white shadow rounded">No assigned issues found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white shadow rounded-lg">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Issue ID</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Student No</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Programme</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Category</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Attachments</th>

                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Status</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Resolve</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issues.map(issue => (
                        <tr 
                          key={issue.id || issue.issue_id} 
                          className="border-t cursor-pointer hover:bg-gray-50"
                          onClick={() => openDetailsModal(issue)}
                        >
                          <td className="px-4 py-2 text-sm text-gray-700">#{issue.issue_id || issue.id}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{issue.student_no || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{issue.programme || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{issue.category || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{issue.attachments || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{issue.status || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            <ResolveButton onClick={(id) => handleResolve(id)} issue={issue} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Resolved Issues Table */}
              <h3 className="text-lg font-semibold mb-4">Resolved Issues</h3>
              {!hasResolvedIssues ? (
                <p className="text-center py-4 bg-white shadow rounded">No resolved issues found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white shadow rounded-lg">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Issue ID</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Student No</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Programme</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Category</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resolvedIssues.map(issue => (
                        <tr 
                          key={issue.id || issue.issue_id} 
                          className="border-t cursor-pointer hover:bg-gray-50"
                          onClick={() => openDetailsModal(issue)}
                        >
                          <td className="px-4 py-2 text-sm text-gray-700">#{issue.issue_id || issue.id}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{issue.student_no || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{issue.programme || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{issue.category || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{issue.status || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                    const issueId = selectedIssue.id || selectedIssue.issue_id;
                    handleResolveIssue(issueId);
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

function ResolveButton({ issue, onClick }) {
  const [resolveText, setResolveText] = useState(issue.status === "resolved" ? "✅" : "Resolve");

  return <button
    className='bg-blue-400 text-white rounded px-2 py-1 hover:bg-blue-800 min-w-[64px]'
    onClick={(e) => {
      e.stopPropagation();
      e.preventDefault();
      if (issue.status === "resolved") return;
      setResolveText("✅");
      // Use the issue.id or issue.issue_id, whichever is available
      const issueId = issue.id || issue.issue_id;
      if (!onClick(issueId)) setResolveText("❌");
    }}>
    {resolveText}
  </button>
}

export default LecturerDashboard;