import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const IssueSubmissionForm = () => {
  const [formData, setFormData] = useState({
    student_no: "",
    reg_no: "",
    category: "",
    course_unit: "",
    year_of_study: "",
    semester: "",
    description: "",
    opened_by: "",
    name_of_Lecturer: "",
    priority: "medium", // Add default priority
    issue_date: new Date().toISOString().split('T')[0], // Add today's date
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();

  // Debug logs
  useEffect(() => {
    console.log("Auth state:", { user, token, isAuthenticated });
    console.log("LocalStorage tokens:", localStorage.getItem('tokens'));
    console.log("LocalStorage user:", localStorage.getItem('user'));
  }, [user, token, isAuthenticated]);

  // Fallback token access if context is not working
  const getAuthToken = () => {
    if (token?.access) {
      return token.access;
    }
    try {
      const tokensStr = localStorage.getItem('tokens');
      if (tokensStr) {
        const tokens = JSON.parse(tokensStr);
        return tokens.access;
      }
    } catch (err) {
      console.error("Failed to parse tokens from localStorage:", err);
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "category", "course_unit", "year_of_study", "semester", "description", "priority",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${field.replace("_", " ")} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit button clicked");

    if (!validateForm()) {
      console.log("Form validation failed", errors);
      return;
    }

    const accessToken = getAuthToken();

    if (!accessToken) {
      alert("Authentication token not found. Please log in again.");
      navigate('/login');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Using token:", accessToken);

      // Get student profile first
      const profileResponse = await axios.get('http://localhost:8000/api/student/profile/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      const profile = profileResponse.data;
      console.log("Profile data:", profile);

      // Then submit the issue
      const result = await axios.post('http://localhost:8000/api/create-issue/', {
        ...formData,
        Student_no: profile.student_no,
        Reg_no: profile.registration_no,
        submitted_by: user?.id || profile.user_id,
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      console.log("Submission response:", result);

      if (result.data) {
        alert(`Issue #${result.data.id} submitted successfully`);
        navigate('/student-dashboard');
      }
    } catch (error) {
      console.error("Error during issue submission:", error);
      setIsSubmitting(false);

      if (error.response?.status === 401) {
        alert("Your session has expired. Please log in again.");
        navigate('/login');
      } else {
        alert(error.response?.data?.message || "An error occurred while submitting the issue.");
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-green-50">
      <div className="max-w-2xl w-full p-6 bg-white shadow-lg rounded-lg">
        {/* Logo */}
        <img
          src="/makerere_university.jpg"
          alt="Makerere University Logo"
          className="mx-auto w-32 h-32 mb-4"
        />

        <h1 className="text-xl font-bold mb-4">Academic Issue Submission</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student Info */}
          {/* Academic Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Category*</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded bg-white"
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
              <label className="block font-medium">Course Unit*</label>
              <input
                type="text"
                name="course_unit"
                value={formData.course_unit}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded bg-white"
              />
              {errors.course_unit && <p className="text-red-500">{errors.course_unit}</p>}
            </div>
          </div>

          {/* Year & Semester */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Year of Study*</label>
              <select
                name="year_of_study"
                value={formData.year_of_study}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded bg-white"
              >
                <option value="">Select Year</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
              {errors.year_of_study && <p className="text-red-500">{errors.year_of_study}</p>}
            </div>
            <div>
              <label className="block font-medium">Semester*</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded bg-white"
              >
                <option value="">Select Semester</option>
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
              </select>
              {errors.semester && <p className="text-red-500">{errors.semester}</p>}
            </div>
          </div>
          
          {/* Name of Lecturer */}
          <div>
            <label className="block font-medium">Name of Lecturer*</label>
            <input
              type="text"
              name="name_of_Lecturer"
              value={formData.name_of_Lecturer}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded bg-white"
            />
            {errors.name_of_Lecturer && <p className="text-red-500">{errors.name_of_Lecturer}</p>}
          </div>
          
          {/* Priority field */}
          <div>
            <label className="block font-medium">Priority*</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded bg-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            {errors.priority && <p className="text-red-500">{errors.priority}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium">Description*</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded bg-white"
              rows="4"
            />
            {errors.description && <p className="text-red-500">{errors.description}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700"
          >
            {isSubmitting ? "Submitting..." : "Submit Issue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IssueSubmissionForm;
