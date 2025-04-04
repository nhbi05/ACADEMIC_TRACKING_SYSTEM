import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Fallback token access if context is not working
  const getAuthToken = React.useCallback(() => {
    if (token?.access) {
      return token.access;
    }
    try {
      const tokensStr = localStorage.getItem('tokens');
      if (tokensStr) {
        const tokens = JSON.parse(tokensStr);
        return tokens.access;
      }
    } catch (err) {
      console.error("Failed to parse tokens from localStorage:", err);
    }
    return null;
  }, [token]);

  useEffect(() => {
    const fetchProfile = async () => {
      const accessToken = getAuthToken();
      
      if (!accessToken) {
        alert("Authentication token not found. Please log in again.");
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('http://localhost:8000/api/student/profile/', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setProfile(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
        
        if (error.response?.status === 401) {
          alert("Your session has expired. Please log in again.");
          navigate('/login');
        } else {
          alert("An error occurred while fetching your profile.");
        }
      }
    };

    fetchProfile();
  }, [getAuthToken, navigate]);

  return (
    <div className="min-h-screen bg-green-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">Student Profile</h1>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-20 bg-gray-100 rounded-full w-20 mx-auto"></div>
                <div className="h-4 bg-gray-100 rounded w-1/4 mx-auto"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="h-4 bg-gray-100 rounded"></div>
                  ))}
                </div>
              </div>
            ) : profile ? (
              <div>
                {/* Profile Header */}
                <div className="text-center mb-8">
                  <div className="inline-block h-20 w-20 rounded-full bg-green-600 text-white text-2xl flex items-center justify-center font-bold mb-3">
                    {user && user.first_name && user.last_name ? (
                      `${user.first_name[0]}${user.last_name[0]}`
                    ) : (
                      "S"
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {user?.first_name} {user?.last_name}
                  </h2>
                  <p className="text-gray-600">{user?.email}</p>
                </div>

                {/* Profile Details */}
                <div className="bg-green-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Student Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Student Number</p>
                      <p className="text-base text-gray-900">{profile.student_no}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Registration Number</p>
                      <p className="text-base text-gray-900">{profile.registration_no}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Programme</p>
                      <p className="text-base text-gray-900">{profile.programme}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Year of Study</p>
                      <p className="text-base text-gray-900">{profile.year_of_study}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-base text-gray-900">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Username</p>
                      <p className="text-base text-gray-900">{user?.username}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end space-x-4">
                  <button 
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                    onClick={() => navigate('/student-dashboard')}
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                  ⚠️
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">Profile Not Found</h3>
                <p className="text-gray-500">Unable to load your profile information.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
