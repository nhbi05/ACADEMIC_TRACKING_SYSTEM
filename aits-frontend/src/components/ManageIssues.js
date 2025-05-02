import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../redux/actions/authActions';
import { 
  fetchAllIssues, 
  fetchLecturers, 
  assignIssue 
} from '../redux/actions/registrarActions';
import { Alert, AlertDescription } from './ui/alert';

const ManageIssues = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get state from Redux
  const { user } = useSelector(state => state.auth);
  const registrarState = useSelector(state => state.registrar || {});
  const issuesState = registrarState.issues || {};
  const assignmentState = registrarState.assignIssue || {};
  const lecturersState = registrarState.lecturers || {};
  
  // Local state for filtering and assignments
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    programme: '',
    search: ''
  });
  const [assignmentData, setAssignmentData] = useState({
    issueId: null,
    lecturerId: '',
    isModalOpen: false
  });
  
  // Extract data from Redux with fallbacks
  const issues = Array.isArray(issuesState.data) ? issuesState.data : [];
  const lecturers = Array.isArray(lecturersState.data) ? lecturersState.data : [];
  const issuesLoading = issuesState.loading !== false;
  const issuesError = issuesState.error || null;
  
  // Fetch issues and lecturers on component mount
  useEffect(() => {
    dispatch(fetchAllIssues())
      .catch(err => console.error('Error fetching issues:', err));
    
    dispatch(fetchLecturers())
      .catch(err => console.error('Error fetching lecturers:', err));
  }, [dispatch]);


  useEffect(() => {
    if (lecturers.length > 0) {
      console.log("First lecturer object:", lecturers[0]);
      console.log("Lecturer IDs:", lecturers.map(l => l.id));
    }
  }, [lecturers]);
  // Update filtered issues when issues or filters change
  useEffect(() => {
    if (issues.length > 0) {
      let result = [...issues];
      
      // Filter by status
      if (filters.status !== 'all') {
        result = result.filter(issue => issue.status === filters.status);
      }
      
      // Filter by programme
      if (filters.programme) {
        result = result.filter(issue => 
          issue.programme && issue.programme.toLowerCase().includes(filters.programme.toLowerCase())
        );
      }
      
      // Filter by search term (name or registration number)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        result = result.filter(issue => 
          (issue.first_name && issue.first_name.toLowerCase().includes(searchTerm)) ||
          (issue.last_name && issue.last_name.toLowerCase().includes(searchTerm)) ||
          (issue.registration_no && issue.registration_no.toLowerCase().includes(searchTerm))
        );
      }
      
      setFilteredIssues(result);
    } else {
      setFilteredIssues([]);
    }
  }, [issues, filters]);

  // Reset the assignment success flag when closing the modal
  useEffect(() => {
    if (!assignmentData.isModalOpen && assignmentState.success) {
      setTimeout(() => {
        dispatch({ type: 'RESET_ASSIGNMENT_SUCCESS' });
      }, 0);
    }
  }, [assignmentData.isModalOpen, assignmentState.success, dispatch]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open assignment modal
  const openAssignModal = (issueId) => {
    // Find the issue to get its current assigned lecturer (if any)
    const issue = issues.find(i => i.id === issueId);
    
    // If the issue has an assigned_to value (user ID), find the corresponding lecturer
    // in the lecturers array to get the user ID
    const currentLecturerId = issue?.assigned_to || '';
    
    setAssignmentData({
      issueId,
      lecturerId: currentLecturerId,
      isModalOpen: true
    });
  };

  // Close assignment modal
  const closeAssignModal = () => {
    setAssignmentData({
      issueId: null,
      lecturerId: '',
      isModalOpen: false
    });
  };

 // When selecting a lecturer from the dropdown
 const handleLecturerChange = (e) => {
  // Get the value
  let selectedValue = e.target.value;
  
  // Convert to integer only if it's not empty string
  if (selectedValue !== '') {
    selectedValue = parseInt(selectedValue, 10);
    
    // Check if conversion was successful
    if (isNaN(selectedValue)) {
      console.error("Failed to convert lecturer ID to number:", e.target.value);
      return;
    }
  } else {
    // If empty string, keep it as empty string
    selectedValue = '';
  }
  
  console.log("Selected lecturer ID:", selectedValue, typeof selectedValue);
  
  setAssignmentData(prev => ({
    ...prev,
    lecturerId: selectedValue
  }));
};
  // Handle lecturer selection
  // Handle lecturer selection
  const handleAssignSubmit = async () => {
    if (!assignmentData.lecturerId) {
      alert('Please select a lecturer');
      return;
    }
    
    try {
      // Add logging to see what's being sent
      console.log("Submitting assignment with data:", { 
        issueId: assignmentData.issueId,
        lecturerId: assignmentData.lecturerId
      });
      
      await dispatch(assignIssue(assignmentData.issueId, assignmentData.lecturerId));
      // Refresh the issues list after assignment
      dispatch(fetchAllIssues());
      closeAssignModal();
    } catch (error) {
      console.error('Failed to assign issue:', error);
      alert(`Assignment failed: ${error.response?.data?.error || error.message}`);
    }
  };
 // After fetching lecturers
useEffect(() => {
  if (lecturers.length > 0) {
    // Filter out lecturers without IDs
    const validLecturers = lecturers.filter(l => l.id !== undefined);
    
    if (validLecturers.length === 0) {
      console.warn("No lecturers with valid IDs found!");
    } else {
      console.log(`Loaded ${validLecturers.length} valid lecturers`);
      console.log("First lecturer:", validLecturers[0]);
      console.log("Lecturer IDs:", validLecturers.map(l => l.id));
    }
  }
}, [lecturers]);
  // Get unique programmes for filter dropdown
  const uniqueProgrammes = [...new Set(issues.map(issue => issue.programme).filter(Boolean))];

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
                onClick={() => navigate('/registrar-dashboard')}
                className="flex items-center w-full px-6 py-3 text-gray-700 hover:bg-green-100 hover:text-green-700 transition-colors"
              >
                <span className="mr-3 text-lg">🏠</span>
                Dashboard
              </button>
            </li>
            <li>
              <button 
                onClick={() => navigate('/manage-students')}
                className="flex items-center w-full px-6 py-3 text-gray-700 hover:bg-green-100 hover:text-green-700 transition-colors"
              >
                <span className="mr-3 text-lg">👥</span>
                Manage Students
              </button>
            </li>
            <li>
              <button 
                onClick={() => navigate('/manage-issues')}
                className="flex items-center w-full px-6 py-3 bg-green-100 text-green-700 transition-colors"
              >
                <span className="mr-3 text-lg">📋</span>
                Manage Issues
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  dispatch(logoutUser());
                  navigate('/login');
                }}
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
            <h2 className="text-xl font-semibold text-gray-800">Manage Issues</h2>
            
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
        
        {/* Main Content Area */}
        <main className="p-6">
          {/* Error Alert */}
          {(issuesError || assignmentState.error) && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                {issuesError || assignmentState.error}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Alert for assignment */}
          {assignmentState.success && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                Issue has been successfully assigned to a lecturer
              </AlertDescription>
            </Alert>
          )}
          
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Filter Issues</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="programme" className="block text-sm font-medium text-gray-700 mb-1">
                  Programme
                </label>
                <select
                  id="programme"
                  name="programme"
                  value={filters.programme}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Programmes</option>
                  {uniqueProgrammes.map((programme, index) => (
                    <option key={index} value={programme}>
                      {programme}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search by Name or Reg No
                </label>
                <input
                  type="text"
                  id="search"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
          
          {/* Issues Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">Academic Issues</h3>
            </div>
            <div className="p-6">
              {issuesLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ) : filteredIssues.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3">Name</th>
                        <th scope="col" className="px-4 py-3">Programme</th>
                        <th scope="col" className="px-4 py-3">Reg. No</th>
                        <th scope="col" className="px-4 py-3">Issue Type</th>
                        <th scope="col" className="px-4 py-3">Course Lecturer</th>
                        <th scope="col" className="px-4 py-3">Assigned To</th>
                        <th scope="col" className="px-4 py-3">Status</th>
                        <th scope="col" className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIssues.map(issue => (
                        <tr key={issue.id} className="border-b hover:bg-gray-100">
                          <td className="px-4 py-3">{`${issue.first_name || ''} ${issue.last_name || ''}`}</td>
                          <td className="px-4 py-3">{issue.programme || 'N/A'}</td>
                          <td className="px-4 py-3">{issue.registration_no || 'N/A'}</td>
                          <td className="px-4 py-3">{issue.category || 'General'}</td>
                          <td className="px-4 py-3">{issue.lecturer_name || 'Not specified'}</td>
                          <td className="px-4 py-3">
                            {issue.assigned_to_name || 
                             (issue.assigned_to ? 'Assigned' : 'Unassigned')}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              issue.status === 'resolved' 
                                ? 'bg-green-100 text-green-800' 
                                : issue.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : issue.status === 'assigned'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {issue.status || 'pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => openAssignModal(issue.id)}
                              className="text-sm text-green-600 hover:text-green-800"
                              disabled={issue.status === 'resolved'}
                            >
                              {issue.assigned_to ? 'Reassign' : 'Assign'}
                            </button>
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
                  <p className="text-gray-500">No academic issues match your current filters</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Assignment Modal */}
          {/* Assignment Modal */}
{assignmentData.isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4">Assign Issue to Lecturer</h2>
      
      <div className="mb-4">
        <label htmlFor="lecturer" className="block text-sm font-medium text-gray-700 mb-1">
          Select Lecturer to Handle Issue
        </label>
        <select
  id="lecturer"
  value={assignmentData.lecturerId || ''}  // Always ensure value is not undefined
  onChange={handleLecturerChange}
  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
>
  <option value="">-- Select a Lecturer --</option>
  {lecturers
    .filter(lecturer => lecturer.id !== undefined)  // Only show lecturers with IDs
    .map((lecturer) => (
      <option key={lecturer.id} value={lecturer.id}>
        {`${lecturer.first_name || ''} ${lecturer.last_name || ''}`}
      </option>
    ))
  }
</select>
      </div>
      
      <div className="flex justify-end space-x-3">      
        <button
          onClick={closeAssignModal}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={handleAssignSubmit}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          disabled={!assignmentData.lecturerId}
        >
          Assign Issue
        </button>
      </div>
    </div>
  </div>
)}
    
        </main>
      </div>
    </div>
  );
};

export default ManageIssues;