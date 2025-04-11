// src/components/auth/Login.js
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearMessages } from "../../redux/actions/authActions";
import { Alert, AlertDescription } from "../ui/alert";
import { useAuth } from '../../context/AuthContext';
import Carousel from "../carousel";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState("student");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = useAuth();
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get state from Redux store
  const { isLoading, error, successMessage, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  // Clear messages when component unmounts or when navigating away
  useEffect(() => {
    return () => {
      dispatch(clearMessages());
    };
  }, [dispatch]);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        switch (loginType) {
          case 'student':
            navigate('/student-dashboard');
            break;
          case 'lecturer':
            navigate('/lecturer-dashboard');
            break;
          case 'registrar':
            navigate('/registrar-dashboard');
            break;
          default:
            navigate('/');
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loginType, navigate]);

  const validateForm = () => {
    if (!username.trim()) {
      dispatch({ type: 'AUTH_FAILURE', payload: "Username is required" });
      return false;
    }
    if (!password) {
      dispatch({ type: 'AUTH_FAILURE', payload: "Password is required" });
      return false;
    }
    if (password.length < 3) {
      dispatch({ type: 'AUTH_FAILURE', payload: "Password must be at least 6 characters" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await dispatch(loginUser({ username, password }, loginType, auth));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Carousel>
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-sm p-8 rounded-lg shadow-lg">
          <div className="mb-8">
            <h1 className="text-center text-3xl font-bold text-green-700">AITS</h1>
            <h2 className="text-center text-sm text-gray-600">
              Academic Issue Tracking System
            </h2>
          </div>

          <div className="flex mb-6 border rounded-lg overflow-hidden">
            {["student", "lecturer", "registrar"].map((type) => (
              <button
                key={type}
                type="button"
                className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                  loginType === type
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setLoginType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {successMessage && (
            <Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading || isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || isSubmitting}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={isLoading || isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>

            <div className="text-center text-sm text-gray-600">
              <span>Don't have an account? </span>
              <Link
                to="/register"
                className="text-green-600 hover:text-green-500 font-medium"
              >
                Register here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Carousel>
  );
};

export default Login;