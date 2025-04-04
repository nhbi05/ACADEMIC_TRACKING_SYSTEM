import React, { useState,  } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { createIssue } from '../redux/actions/studentActions';
import { Alert } from './ui/alert';

const IssueSubmissionForm = () => {
  const [formData, setFormData] = useState({
    category: "",
    course_unit: "",
    year_of_study: "",
    semester: "",
    description: "",
    assigned_to: "",
  });

  const [staffUsers, setStaffUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const dispatch = useDispatch();
  
  // Get auth tokens from Redux store instead of AuthContext
  const { tokens } = useSelector(state => state.auth);
  const { submitting, error: submissionError } = useSelector(state => state.issues);

  useEffect(() => {
    const fetchStaff = async () => {
      if (!tokens || !tokens.access) {
        console.error("No access token available");
        return;
      }

      try {
        const response = await axios.get("/users/staff/", {
          headers: { Authorization: `Bearer ${tokens.access}` }
        });
        setStaffUsers(response.data);
      } catch (error) {
        console.error("Error fetching staff:", error);
        setErrors(prev => ({ ...prev, staff: "Failed to load staff list" }));
      }
    };
    
    if (tokens && tokens.access) fetchStaff();
  }, [tokens]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['category', 'course_unit', 'year_of_study', 'semester', 'description'];
    requiredFields.forEach(field => {
      if (!formData[field]) newErrors[field] = `${field.replace(/_/g, ' ')} is required`;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    
    if (!tokens || !tokens.access) {
      setErrors(prev => ({ ...prev, form: "Authentication error. Please log in again." }));
      return;
    }
  
    try {
      const profile = await axios.get('/student/profile/', {
        headers: { Authorization: `Bearer ${tokens.access}` }
      }).then(res => res.data);
  
      const issueData = {
        ...formData,
        Student_no: profile.student_no,
        Reg_no: profile.registration_no,
        submitted_by: user.id,
        priority: "medium",
        issue_date: new Date().toISOString()
      };
  
      console.log("Submitting issue data:", issueData);
      
      // Pass the tokens object directly to the action
      const result = await dispatch(createIssue(issueData, tokens));
      
      console.log("Submission result:", result);
      
      if (result.payload?.id) {
        setSuccessMessage(`Issue #${result.payload.id} submitted successfully!`);
        setTimeout(() => navigate('/student-dashboard'), 3000);
      } else {
        setErrors(prev => ({ ...prev, form: "Failed to submit issue - no ID returned" }));
      }
    } catch (err) {
      console.error("Submission error:", err);
      setErrors(prev => ({ 
        ...prev, 
        form: submissionError || err.response?.data?.message || err.message || "Failed to submit issue" 
      }));
    }
  };

  // Rest of your component remains the same
  return (
    <div className="min-h-screen flex justify-center items-center bg-green-50 p-4">
      <div className="max-w-2xl w-full p-6 bg-white shadow-lg rounded-lg">
        <img
          src="/makerere_university.jpg"
          alt="Makerere University Logo"
          className="mx-auto w-32 h-32 mb-4"
        />

        <h1 className="text-2xl font-bold text-center mb-6 text-green-800">
          Academic Issue Submission
        </h1>
        
        {/* Success message */}
        {successMessage && (
          <Alert variant="success" className="mb-4">
            {successMessage}
          </Alert>
        )}

        {/* Error message */}
        {errors.form && (
          <Alert variant="destructive" className="mb-4">
            {errors.form}
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category and Course Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Category*
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full p-2 border rounded bg-white ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Category</option>
                <option value="missing_marks">Missing Marks</option>
                <option value="appeal">Appeal</option>
                <option value="correction">Correction</option>
                <option value="others">Others</option>
              </select>
              {errors.category && <p className="text-red-500">{errors.category}</p>}
            </div>
            
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Course Unit*
              </label>
              <input
                type="text"
                name="course_unit"
                value={formData.course_unit}
                onChange={handleChange}
                className={`w-full p-2 border rounded bg-white ${
                  errors.course_unit ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g. CSC 101"
              />
              {errors.course_unit && (
                <Alert variant="destructive" className="mt-1 text-sm p-2">
                  {errors.course_unit}
                </Alert>
              )}
            </div>
          </div>

          {/* Year and Semester */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Year of Study*
              </label>
              <select
                name="year_of_study"
                value={formData.year_of_study}
                onChange={handleChange}
                className={`w-full p-2 border rounded bg-white ${
                  errors.year_of_study ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Year</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
              {errors.year_of_study && (
                <Alert variant="destructive" className="mt-1 text-sm p-2">
                  {errors.year_of_study}
                </Alert>
              )}
            </div>
            
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Semester*
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className={`w-full p-2 border rounded bg-white ${
                  errors.semester ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Semester</option>
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
              </select>
              {errors.semester && (
                <Alert variant="destructive" className="mt-1 text-sm p-2">
                  {errors.semester}
                </Alert>
              )}
            </div>
          </div>
          {/*name_of_lecturer*/}
          <div>
              <label className="block font-medium">name_of_Lecturer*</label>
              <input
                type="text"
                name="name_of_Lecturer"
                value={formData.name_of_Lecturer}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded bg-white"
              />
            </div>
          

          {/* Description */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Description*
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full p-2 border rounded bg-white ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              rows="5"
              placeholder="Describe your issue in detail..."
            />
            {errors.description && (
              <Alert variant="destructive" className="mt-1 text-sm p-2">
                {errors.description}
              </Alert>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 px-4 rounded-md text-white font-medium ${
              submitting 
                ? 'bg-green-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            } transition-colors`}
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Issue"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IssueSubmissionForm;