// src/components/StudentDashboard.js
import React from 'react';

const StudentDashboard = () => {
  const issues = [
    { title: 'Missing Marks in Math', status: 'Open' },
    { title: 'Appeal for English Grade', status: 'In Progress' }
  ];

  return (
    <div>
      <h2>Student Dashboard</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue, index) => (
            <tr key={index}>
              <td>{issue.title}</td>
              <td>{issue.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentDashboard;
