import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {  useDispatch } from 'react-redux';
import { Alert, AlertDescription } from '../ui/alert';
import axios from 'axios'; // For API calls
import { logoutUser } from '../../redux/actions/authActions';

const LecturerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
 // const { user } = useSelector(state => state.auth); // Use 'user' if needed
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
          <h3 className="text-lg font-semibold mb-4">Assigned Issues</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map(issue => (
              <div key={issue.id} className="bg-white rounded-lg shadow p-4">
                <h4 className="text-md font-semibold">{issue.title}</h4>
                <p className="text-sm text-gray-600">{issue.description}</p>
                <p className="text-sm text-gray-500">Status: {issue.status}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LecturerDashboard;