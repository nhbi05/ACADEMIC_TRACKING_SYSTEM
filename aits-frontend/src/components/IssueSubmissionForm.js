import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { createIssue } from '../redux/actions/studentActions';
import { Alert, AlertDescription } from './ui/alert';

const IssueSubmissionForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get the submission state and user info from redux
  const { submitting, error } = useSelector(state => state.issues || {});
  const user = useSelector(state => state.auth.user); // Assuming user info is stored in auth reducer
  
  // Extended form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'missing_marks', // Changed from category_choices to category
    attachments: null,
    lecturer_name: '',
    semester: 'Semester 1', // Changed to match exact format expected by backend
    year_of_study: '',
    registration_no: user?.student_profile?.registration_no || '' // Pre-fill if available
  });
  
  // Effect to update registration number if user data loads after component mount
  useEffect(() => {
    if (user?.student_profile?.registration_no) {
      setFormData(prev => ({
        ...prev,
        registration_no: user.student_profile.registration_no
      }));
    }
  }, [user]);
  
  // Success message state
  const [successMessage, setSuccessMessage] = useState('');
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle file upload
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      attachments: e.target.files[0]
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Ensure registration_no is set from user profile if not already in form
    const registrationNo = formData.registration_no || user?.student_profile?.registration_no || '';
    
    // Validate registration number before submitting
    if (!registrationNo) {
      alert('Registration number is required');
      return;
    }
    
    // Create form data object for file upload
    const issueData = new FormData();
    issueData.append('title', formData.title);
    issueData.append('description', formData.description);
    issueData.append('category', formData.category); // Changed from category_choices to category
    
    // Add the new fields to the form data
    issueData.append('lecturer_name', formData.lecturer_name);
    issueData.append('semester', formData.semester);
    issueData.append('year_of_study', formData.year_of_study);
    issueData.append('registration_no', registrationNo);
    
    if (formData.attachments) {
      issueData.append('attachments', formData.attachments);
    }
    
    try {
      await dispatch(createIssue(issueData));
      setSuccessMessage('Issue submitted successfully!');
      
      // Reset form after successful submission
      setFormData({
        title: '',
        description: '',
        category: 'missing_marks', // Changed from category_choices to category
        attachments: null,
        lecturer_name: '',
        semester: 'Semester 1',
        year_of_study: '',
        registration_no: registrationNo // Keep the registration number
      });
      
      // Redirect to issues list after 2 seconds
      setTimeout(() => {
        navigate('/my-issues');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting issue:', error);
      // Error will be handled by the reducer and displayed via the error state
    }
  };
  
  return (
    <div className="flex h-screen bg-green-50">
      {/* Sidebar Navigation can be imported from your StudentDashboard component */}
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Submit New Issue</h2>
          </div>
        </header>
        
        <main className="p-6">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
            {/* MUK Logo */}
            <div className="max-w-2xl w-full p-6 bg-white shadow-lg rounded-lg">
              <img
                src="/makerere_university.jpg"
                alt="Makerere University Logo"
                className="mx-auto w-32 h-32 mb-4"
              />
            </div>
            <h3 className="text-xl font-semibold text-green-700 text-center mb-6">
              Academic Issue Submission Form
            </h3>
            
            {/* Success Message */}
            {successMessage && (
              <Alert className="mb-6 bg-green-100 border-green-500 text-green-800">
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
            
            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Student Information Section */}
              <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
                <h4 className="font-medium text-gray-700 mb-3">Student Information</h4>
                
                {/* Registration Number - Read Only */}
                <div className="mb-4">
                  <label htmlFor="registration_no" className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Number *
                  </label>
                  <input
                    type="text"
                    id="registration_no"
                    name="registration_no"
                    value={formData.registration_no}
                    onChange={handleChange} // Changed to allow manual entry if not auto-filled
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {user?.student_profile?.registration_no ? 
                      "Auto-filled from your profile" : 
                      "Please enter your registration number"}
                  </p>
                </div>
                
                {/* Year of Study */}
                <div className="mb-4">
                  <label htmlFor="year_of_study" className="block text-sm font-medium text-gray-700 mb-1">
                    Year of Study *
                  </label>
                  <select
                    id="year_of_study"
                    name="year_of_study"
                    value={formData.year_of_study}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Year</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>
                
                {/* Semester */}
                <div className="mb-0">
                  <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                    Semester *
                  </label>
                  <select
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                  </select>
                </div>
              </div>
              
              {/* Issue Title */}
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter a brief title for your issue"
                />
              </div>
              
              {/* Issue Category */}
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="missing_marks">Missing Marks</option>
                  <option value="appeal">Appeal</option>
                  <option value="correction">Correction</option>
                  <option value="others">Others</option>
                </select>
              </div>
              
              {/* Lecturer Name */}
              <div className="mb-4">
                <label htmlFor="lecturer_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Lecturer Name *
                </label>
                <input
                  type="text"
                  id="lecturer_name"
                  name="lecturer_name"
                  value={formData.lecturer_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter the name of the lecturer"
                />
              </div>
              
              {/* Issue Description */}
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Please provide a detailed description of your issue"
                ></textarea>
              </div>
              
              {/* File Attachment */}
              <div className="mb-6">
                <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-1">
                  Attachments (Optional)
                </label>
                <input
                  type="file"
                  id="attachments"
                  name="attachments"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload any relevant documents (PDF, images, etc.)
                </p>
              </div>
              
              {/* Submission Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/student-dashboard')}
                  className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Issue'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default IssueSubmissionForm;