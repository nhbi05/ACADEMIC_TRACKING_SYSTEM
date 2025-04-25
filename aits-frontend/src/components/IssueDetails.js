import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const IssueDetails = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIssues = async () => {
     
      if (!token || !token.access) {
        alert("Token is not available. Please log in.");
        return;
      }

      if (!user) {
        alert("User is not available. Please log in.");
        return;
      }

      try {
        const response = await axios.get('http://localhost:8000/api/my-issues/', {
          headers: {
            Authorization: `Bearer ${token.access}`,
          },
        });
        setIssues(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching issues:', error);
        setLoading(false);
        alert("An error occurred while fetching issues.");
      }
    };

    fetchIssues();
  }, [token, user, navigate]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-green-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">My Issues</h1>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-24 bg-gray-100 rounded"></div>
                ))}
              </div>
            ) : issues.length > 0 ? (
              <div className="space-y-4">
                {issues.map((issue) => (
                  <div key={issue.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Issue #{issue.id} - {issue.course_unit}
                        </h3>
                        <p className="text-gray-600 mt-1">{issue.description}</p>
                        <div className="mt-2 space-x-4">
                          <span className="text-sm text-gray-500">
                            Category: {issue.category}
                          </span>
                          <span className="text-sm text-gray-500">
                            Lecturer: {issue.name_of_Lecturer}
                          </span>
                        </div>
                        <div className="mt-2 space-x-4">
                          <span className="text-sm text-gray-500">
                            Year: {issue.year_of_study}
                          </span>
                          <span className="text-sm text-gray-500">
                            Semester: {issue.semester}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(issue.status)}`}>
                          {issue.status || 'Pending'}
                        </span>
                        <span className="text-sm text-gray-500 mt-2">
                          {new Date(issue.issue_date).toLocaleDateString()}
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
                <h3 className="text-lg font-medium text-gray-800 mb-1">No issues found</h3>
                <p className="text-gray-500">You haven't submitted any issues yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetails;
