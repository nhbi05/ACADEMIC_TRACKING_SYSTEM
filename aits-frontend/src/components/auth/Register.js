// src/components/auth/Register.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearMessages } from '../../redux/actions/authActions';
import { Alert, AlertDescription } from '../ui/alert';
import Carousel from '../carousel';
//import './styles/style_login.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    role: 'student',
    college: '',
    department: '',
    student_no: '',        
    //year_level: 1,
    programme: '' ,      
    registration_no:""
  });

  const [passwordError, setPasswordError] = useState('');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get values from Redux store
  const { isLoading, error, successMessage } = useSelector(state => state.auth);

  // Clear messages when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearMessages());
    };
  }, [dispatch]);

  // Redirect on successful registration
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
      setPasswordError('');
      console.log("Form data before validation:", formData);
    
    // Validate passwords match
    if (formData.password !== formData.password2) {
      setPasswordError('Passwords do not match');
      return;
    }
  
     // Create the appropriate profile data based on role
    let profileData = {};
    if (formData.role === 'student') {
      profileData = {
        student_profile: {

          student_no: formData.student_no,
          registration_no: formData.registration_no, // Added registration number
          college: formData.college,
          programme: formData.programme,

        }
      };
    } else if (formData.role === 'lecturer') {
      profileData = {
        lecturer_profile: {
          department: formData.department,
        }
      };
    } else if (formData.role === 'registrar') {
      profileData = {
        registrar_profile: {
          college: formData.college,
        }
      };
    }

    
    const registrationData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      password2: formData.password2,
      first_name: formData.first_name,
      last_name: formData.last_name,
      role: formData.role,
      ...profileData
    };

    dispatch(registerUser(registrationData));
  };

  return (
    <Carousel>
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Register</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 hover:text-green-500 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {passwordError && (
          <Alert variant="destructive">
            <AlertDescription>{passwordError}</AlertDescription>
          </Alert>
        )}
        
        {successMessage && (
          <Alert className="bg-green-50 text-green-700 border-green-200">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="First Name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
              <input
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>

            <input
              type="text"
              required
              className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />

            <input
              type="email"
              required
              className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <input
                type="password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Confirm Password"
                value={formData.password2}
                onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
              />
            </div>

            <select
              className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option className="hover:bg-green-500 hover:text-white" value="student">Student</option>
              <option className="hover:bg-green-500 hover:text-white" value="lecturer">Lecturer</option>
              <option className="hover:bg-green-500 hover:text-white" value="registrar">Registrar</option>
            </select>

            {/* Role-specific fields */}
            {formData.role === 'student' && (
              <div className="space-y-4">
                  <input
                  type="text"
                  required
                  className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="College"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                />
                
                <select
                  required
                  className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={formData.programme}
                  onChange={(e) => setFormData({ ...formData, programme: e.target.value })}
                >
                  <option value="">Select a programme</option>
                  <option value="BSCS">Bachelor of Science in Computer Science</option>
                  <option value="BSSE">Bachelor of Science in Software Engineering</option>
                  <option value="BIT">Bachelor of Information Systems & Technology</option>
                  <option value="BLIS">Bachelor of Library & Information Systems</option>
                </select>
               
                  <h3 className="text-lg font-medium text-green-700 mb-3">Student Info</h3>
                  <div className="space-y-4">
                    <div>
                      <input
                        id="student_no"
                        type="text"
                        required
                        className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder="Student number"
                        value={formData.student_no}
                        onChange={(e) => setFormData({ ...formData, student_no: e.target.value })}
                      />
                      </div>
                      <div>
                      <input
                        id="registration_no"
                        type="text"
                        required
                        className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder="Registration number"
                        value={formData.registration_no}
                        onChange={(e) => setFormData({ ...formData, registration_no: e.target.value })}
                      />
                    </div>
                  </div>
                {/*</div>*/}
                
              </div>
            )}

            {formData.role === 'lecturer' && (
              <div className="space-y-4">
                <input
                  type="text"
                  required
                  className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            )}

            {formData.role === 'registrar' && (
              <div className="space-y-4">
                <input
                  type="text"
                  required
                  className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="College"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </span>
            ) : (
              'Register'
            )}
          </button>
        </form>
      </div>
    </div>
    </Carousel>
  );
};

export default Register;