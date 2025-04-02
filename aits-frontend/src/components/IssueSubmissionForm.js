import React, { useState,  } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

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
    priority: "",
    issue_date: "", 
  });


  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line
  const [submitted, setSubMitted] = useState(false);
  const navigate = useNavigate();
  const { user, token } = useAuth();


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

    if (!validateForm()) return;

    // Check if token and user are available
    if (!token || !token.access) {
      alert("Token is not available. Please log in.");
      return;
    }

    if (!user) {
      alert("User is not available. Please log in.");
      return;
    }

    try {
      const profile = await axios.get('http://localhost:8000/api/student/profile/', {
        headers: {
          Authorization: `Bearer ${token.access}`,
        },
      }).then(res => res.data).catch(err => {
        console.error("Error fetching profile data:", err);
        return null;
      });

      if (profile === null) {
        alert("Could not fetch your profile data");
        return;
      }

      setIsSubmitting(true);
      await axios.post('http://localhost:8000/api/create-issue/', {
        ...formData,
        Student_no: profile['student_no'],
        Reg_no: profile['registration_no'],
        submitted_by: user['id'],
      }, {
        headers: {
          Authorization: `Bearer ${token.access}`,
        },
      }).then(result => {
        let { data: { id } } = result;
        let cont = prompt(`Issue #${id} submitted successfully`, 'OK to proceed');
        if (cont) navigate('/student-dashboard');
      }).catch(error => {
        setIsSubmitting(false);
        alert("Failed creating Issue");
        console.log("Failed creating issue", error);
      });
    } catch (error) {
      console.error("Error during issue submission:", error);
      setIsSubmitting(false);
      alert("An error occurred while submitting the issue.");
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
            <label className="block font-medium">Description*</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded bg-white"
              rows="4"
            />
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
