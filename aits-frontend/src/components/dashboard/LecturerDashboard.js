import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios'; // For API calls
import { logoutUser } from '../../redux/actions/authActions';

const LecturerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await axios.get('/api/resolved-issues/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('access')}` },
        });
        setIssues(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch issues.');
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  

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
                className="flex items-center w-full px-6 py-3 text-gray-700 hover:bg-green-100 hover:text-green-700 transition-colors"
              >
                <span className="mr-3 text-lg">📄</span>
                Assigned Issues
              </button>
            </li>
            <li>
              <button
                className="flex items-center w-full px-6 py-3 text-gray-700 hover:bg-green-100 hover:text-green-700 transition-colors"
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
          <div className="px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">Lecturer Dashboard</h2>
          </div>
        </header>
        <main className="p-6">
          {/* Dashboard Summary */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700">Assigned Issues</h3>
              <p className="text-2xl font-bold text-green-600">{issues.filter(issue => issue.status === 'Assigned').length}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700">Pending Issues</h3>
              <p className="text-2xl font-bold text-red-600">{issues.filter(issue => issue.status === 'Pending').length}</p>
            </div>
          </div>

          {/* Issues Table */}
          <h3 className="text-lg font-semibold mb-4">Issues Overview</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Student No</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Course Code</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Issue Type</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {issues.map(issue => (
                  <tr key={issue.id} className="border-t">
                    <td className="px-4 py-2 text-sm text-gray-700">{issue.student_no}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{issue.course_code}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{issue.issue_type}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{issue.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LecturerDashboard;