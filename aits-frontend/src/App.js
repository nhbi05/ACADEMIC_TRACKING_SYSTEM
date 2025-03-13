import { Routes, Route } from 'react-router-dom'; 
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import './styles/style_login.css';
<<<<<<< HEAD
import StudentDashboard from './components/dashboard/StudentDashboard';
=======
import StudentDashboard from './components/dashboards/StudentDashboard';
>>>>>>> 37a0c4f8d9042f1fa78118cd84b076d4649ea436
import { AuthProvider } from './context/AuthContext';
import { Navigate } from 'react-router-dom';
import React from 'react';
import IssueSubmissionForm from './components/IssueSubmissionForm';  // Keep IssueSubmissionForm
import ProtectedRoute from './components/ProtectedRoute';

<<<<<<< HEAD
=======
//const StudentDashboard = () => <h1 className="text-center mt-10 text-3xl text-[#155843]">Student Dashboard</h1>;
>>>>>>> 37a0c4f8d9042f1fa78118cd84b076d4649ea436
const LecturerDashboard = () => <h1 className="text-center mt-10 text-3xl text-[#155843]">Lecturer Dashboard</h1>;
const RegistrarDashboard = () => <h1 className="text-center mt-10 text-3xl text-[#155843]">Registrar Dashboard</h1>;

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/student-dashboard" element={<ProtectedRoute element={<StudentDashboard />} />} />
          <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
          <Route path="/registrar-dashboard" element={<RegistrarDashboard />} />
          <Route path="/submit-issue" element={<ProtectedRoute element={<IssueSubmissionForm />} />} />
          <Route path="/student-issues" element={<ProtectedRoute element={<IssueSubmissionForm />} />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;