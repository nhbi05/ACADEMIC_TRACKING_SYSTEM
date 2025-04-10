import { Routes, Route } from 'react-router-dom'; 
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import './styles/style_login.css';
import StudentDashboard from './components/dashboard/StudentDashboard';
import RegistrarDashboard from './components/dashboard/RegistrarDashboard';
import LecturerDashboard from './components/dashboard/LecturerDashboard';
import { AuthProvider } from './context/AuthContext';
import { Navigate } from 'react-router-dom';
import React from 'react';
import IssueSubmissionForm from './components/IssueSubmissionForm';  // Keep IssueSubmissionForm
import ViewIssues from './components/ViewIssues';  
import ProtectedRoute from './components/ProtectedRoute';
import IssueDetails from './components/IssueDetails';
import Profile from './components/Profile';
import Settings from './components/Settings';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} /> 
          <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
          <Route path="/registrar-dashboard" element={<RegistrarDashboard />} />
          <Route path="/my-issues/" element={<ViewIssues />} />
          <Route path="/submit-issue" element={<ProtectedRoute element={<IssueSubmissionForm />} />} />
          <Route path="/student-issues" element={<ProtectedRoute element={<IssueSubmissionForm />} />} />
          <Route path="/student/issues" element={<ProtectedRoute element={<IssueDetails />} />} />
          <Route path="/student/profile" element={<ProtectedRoute element={<Profile />} />} />
          <Route path="/student/issues/create" element={<IssueSubmissionForm />} />
          <Route path="/student/settings" element={<ProtectedRoute element={<Settings />} />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;