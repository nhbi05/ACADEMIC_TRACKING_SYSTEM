// src/components/IssueSubmissionForm.js
import React, { useState } from 'react';

const IssueSubmissionForm = () => {
  const [issue, setIssue] = useState({
    title: '',
    description: '',
    category: '',
    courseCode: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIssue({ ...issue, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(issue);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Title:</label>
      <input
        type="text"
        name="title"
        value={issue.title}
        onChange={handleChange}
        required
      />
      <label>Description:</label>
      <textarea
        name="description"
        value={issue.description}
        onChange={handleChange}
        required
      ></textarea>
      <label>Category:</label>
      <select
        name="category"
        value={issue.category}
        onChange={handleChange}
        required
      >
        <option value="">Select Category</option>
        <option value="missingMarks">Missing Marks</option>
        <option value="appeal">Appeal</option>
        <option value="correction">Correction</option>
      </select>
      <label>Course Code:</label>
      <input
        type="text"
        name="courseCode"
        value={issue.courseCode}
        onChange={handleChange}
        required
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default IssueSubmissionForm;
