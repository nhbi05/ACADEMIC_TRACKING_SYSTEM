// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';  // Using Routes for React Router v6
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import { AuthProvider } from './context/AuthContext';
import IssueSubmissionForm from './components/IssueSubmissionForm';
import StudentDashboard from './components/StudentDashboard';

const StudentDashboardPage = () => (
  <h1 className="text-center mt-10 text-3xl text-[#155843]">Student Dashboard</h1>
);
const LecturerDashboard = () => (
  <h1 className="text-center mt-10 text-3xl text-[#155843]">Lecturer Dashboard</h1>
);
const RegistrarDashboard = () => (
  <h1 className="text-center mt-10 text-3xl text-[#155843]">Registrar Dashboard</h1>
);

const HomePage = () => (
  <div>
    <h1>Welcome to the Academic Tracking System</h1>
    <p>This is the homepage of the AITS application.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Route for Home (/) */}
          <Route path="/" element={<HomePage />} />

          {/* Existing Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Add your new routes */}
          <Route path="/student-dashboard" element={<StudentDashboardPage />} />
          <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
          <Route path="/registrar-dashboard" element={<RegistrarDashboard />} />

          {/* New Routes for Issue Submission */}
          <Route path="/submit-issue" element={<IssueSubmissionForm />} />
          <Route path="/student-issues" element={<StudentDashboard />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
