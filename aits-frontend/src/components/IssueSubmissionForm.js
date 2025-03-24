import React, { useState, useEffect } from "react";
import axios from "axios";

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
    assigned_to: "",
    priority: "",
    issue_date: "",
  });

  const [staffUsers, setStaffUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await axios.get("/api/users/staff/");
        setStaffUsers(response.data);
      } catch (error) {
        console.error("Error fetching staff:", error);
      }
    };
    fetchStaff();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "student_no",
      "reg_no",
      "category",
      "course_unit",
      "year_of_study",
      "semester",
      "description",
      "opened_by",
      "priority",
      "issue_date",
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

    setIsSubmitting(true);
    try {
      await axios.post("/api/issues/create/", {
        ...formData,
        submitted_by: localStorage.getItem("userId"),
      });
      alert("Issue submitted successfully!");
      setFormData({
        student_no: "",
        reg_no: "",
        category: "",
        course_unit: "",
        year_of_study: "",
        semester: "",
        description: "",
        opened_by: "",
        assigned_to: "",
        priority: "",
        issue_date: "",
      });
    } catch (error) {
      console.error("Submission error:", error.response?.data);
      alert(
        `Failed to submit issue: ${error.response?.data?.error || error.message}`
      );
    } finally {
      setIsSubmitting(false);
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Student Number*</label>
              <input
                type="text"
                name="student_no"
                value={formData.student_no}
                onChange={handleChange}
                className={`w-full p-2 border ${errors.student_no ? "border-red-500" : "border-gray-300"} rounded bg-white`}
              />
              {errors.student_no && <span className="text-red-500 text-sm">{errors.student_no}</span>}
            </div>
            <div>
              <label className="block font-medium">Registration Number*</label>
              <input
                type="text"
                name="reg_no"
                value={formData.reg_no}
                onChange={handleChange}
                className={`w-full p-2 border ${errors.reg_no ? "border-red-500" : "border-gray-300"} rounded bg-white`}
              />
              {errors.reg_no && <span className="text-red-500 text-sm">{errors.reg_no}</span>}
            </div>
          </div>

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

          {/* Assigned Staff */}
          <div>
            <label className="block font-medium">Assigned To</label>
            <select
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded bg-white"
            >
              <option value="">Select Staff</option>
              {staffUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
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
