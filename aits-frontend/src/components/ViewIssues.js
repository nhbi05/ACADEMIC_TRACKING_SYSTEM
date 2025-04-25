import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchIssues } from '../redux/actions/studentActions';
import { useNavigate } from 'react-router-dom';

const ViewIssues = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { issues, loading, error } = useSelector(state => state.issues || {});

  useEffect(() => {
    dispatch(fetchIssues());
  }, [dispatch]);

  const handleViewDetails = (issue) => {
    setSelectedIssue(issue);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedIssue(null);
  };

  const filteredIssues = issues?.filter(issue => {
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesSearch = 
      (issue.title && issue.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (issue.description && issue.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });
 

  return (
    // Changed the background to light green for the entire component
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Academic Issues</h1>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search issues..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
              <button
                onClick={() => navigate('/submit-issue')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                New Issue
              </button>
            </div>
          </div>
        </div>
        
        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
            <p>Error: {error}</p>
          </div>
        )}
        
        {!loading && issues?.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
              📄
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">No issues found</h3>
            <p className="text-gray-500 mb-4">Create your first issue to get started</p>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              onClick={() => navigate('/submit-issue')}
            >
              Create Issue
            </button>
          </div>
        )}
        
        {!loading && filteredIssues?.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 text-left font-medium text-gray-600">Title</th>
                    <th className="p-4 text-left font-medium text-gray-600">Status</th>
                    <th className="p-4 text-left font-medium text-gray-600">Last Updated</th>
                    <th className="p-4 text-left font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredIssues.map(issue => (
                    <tr key={issue.id} className="hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-800">{issue.title}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          issue.status === 'resolved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {issue.status === 'resolved' ? 'Resolved' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">
                        {new Date(issue.updated_at || issue.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleViewDetails(issue)}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {!loading && filteredIssues?.length === 0 && issues?.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">No issues match your search or filter criteria.</p>
            <button 
              onClick={() => {setStatusFilter('all'); setSearchTerm('');}}
              className="mt-2 text-green-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
      
      {/* Issue Details Modal */}
      {isModalOpen && selectedIssue && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 text-center">
            {/* Overlay */}
            <div className="fixed inset-0 bg-gray-800 bg-opacity-75 transition-opacity" onClick={closeModal}></div>
            
            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900" id="modal-title">
                    Issue Details
                  </h3>
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500"
                    onClick={closeModal}
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
                
                <div className="mt-4">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xl font-semibold text-gray-800">{selectedIssue.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedIssue.status === 'resolved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedIssue.status === 'resolved' ? 'Resolved' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(selectedIssue.created_at).toLocaleDateString()} | 
                      {selectedIssue.updated_at && selectedIssue.updated_at !== selectedIssue.created_at && 
                        ` Updated: ${new Date(selectedIssue.updated_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Description</h5>
                    <p className="text-gray-800 whitespace-pre-line">{selectedIssue.description}</p>
                  </div>
                  
                  {selectedIssue.attachments && selectedIssue.attachments.length > 0 && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Attachments</h5>
                      <ul className="text-sm text-blue-600">
                        {selectedIssue.attachments.map((attachment, index) => (
                          <li key={index} className="mb-1">
                            <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {attachment.name || `Attachment ${index + 1}`}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedIssue.comments && selectedIssue.comments.length > 0 && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Comments</h5>
                      <div className="space-y-3">
                        {selectedIssue.comments.map((comment, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-md">
                            <div className="flex justify-between">
                              <p className="text-sm font-medium">{comment.author}</p>
                              <p className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</p>
                            </div>
                            <p className="text-sm mt-1">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  Close
                </button>
                {selectedIssue.status !== 'resolved' && (
                  <button
                    type="button"
                    className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      closeModal();
                      navigate(`/student/issues/edit/${selectedIssue.id}`);
                    }}
                  >
                    Edit Issue
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewIssues;