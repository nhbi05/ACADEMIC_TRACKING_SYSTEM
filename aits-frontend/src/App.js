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
<<<<<<< HEAD
import IssueDetails from './components/IssueDetails';
import Profile from './components/Profile';
import Settings from './components/Settings';

=======
>>>>>>> 33c444bdc549bbe66ebdfc2fa68ff7a0e1a58393
//const StudentDashboard = () => <h1 className="text-center mt-10 text-3xl text-[#155843]">Student Dashboard</h1>;
//const LecturerDashboard = () => <h1 className="text-center mt-10 text-3xl text-[#155843]">Lecturer Dashboard</h1>;
//const RegistrarDashboard = () => <h1 className="text-center mt-10 text-3xl text-[#155843]">Registrar Dashboard</h1>;

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
<<<<<<< HEAD
          <Route path="/student/issues" element={<ProtectedRoute element={<IssueDetails />} />} />
          <Route path="/student/profile" element={<ProtectedRoute element={<Profile />} />} />
          <Route path="/student/issues/create" element={<IssueSubmissionForm />} />
          <Route path="/student/settings" element={<ProtectedRoute element={<Settings />} />} />
=======
         
>>>>>>> 33c444bdc549bbe66ebdfc2fa68ff7a0e1a58393
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;