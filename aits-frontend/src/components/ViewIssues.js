import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchIssues } from '../redux/actions/studentActions'

import { useNavigate } from 'react-router-dom';

const ViewIssues = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { issues, loading, error } = useSelector(state => state.issues || {});

  useEffect(() => {
    dispatch(fetchIssues());
  }, [dispatch]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">View Issues</h1>
      
      {loading && <p>Loading issues...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      
      {issues?.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Created At</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.map(issue => (
                <tr key={issue.id} className="border-t">
                  <td className="p-3">{issue.title}</td>
                  <td className={`p-3 ${issue.status === 'resolved' ? 'text-green-600' : 'text-yellow-600'}`}>{issue.status}</td>
                  <td className="p-3">{new Date(issue.created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <button 
                      onClick={() => navigate(`my-issues/${issue.id}`)}
                      className="text-blue-600 hover:underline"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No issues found.</p>
      )}
    </div>
  );
};

export default ViewIssues;
