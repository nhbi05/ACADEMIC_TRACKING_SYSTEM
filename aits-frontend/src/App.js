/// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';  // Remove BrowserRouter import
import Register from './components/auth/Register';
import Login from './components/auth/Login';
//import StudentDashboard from './components/dashboard/StudentDashboard';
import { AuthProvider } from './context/AuthContext';



const StudentDashboard = () => <h1 className="text-center mt-10 text-3xl text-[#155843]">Student Dashboard</h1>;
const LecturerDashboard = () => <h1 className="text-center mt-10 text-3xl text-[#155843]">Lecturer Dashboard</h1>;
const RegistrarDashboard = () => <h1 className="text-center mt-10 text-3xl text-[#155843]">Registrar Dashboard</h1>;

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
          <Route path="/registrar-dashboard" element={<RegistrarDashboard />} />
        </Routes>
        
      </div>
    </AuthProvider>
  );
}

export default App;