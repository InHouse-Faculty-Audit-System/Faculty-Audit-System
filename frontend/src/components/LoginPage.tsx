import React, { useState } from "react";
import { Mail, User, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

// Add the onAdminClick prop
interface LoginPageProps {
  onAdminClick: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onAdminClick }) => {
  const [email, setEmail] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !facultyId) {
      setError("Please fill in all fields");
      return;
    }

    const success = await login(facultyId, email);
    if (!success) {
      setError("Invalid faculty ID or email");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Faculty Audit System
          </h2>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="facultyId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Faculty ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="facultyId"
                  name="facultyId"
                  type="text"
                  required
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter your faculty ID"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>
        </div>
        {/* 3. Add this new div for the admin link */}
        <div className="text-center">
          <button onClick={onAdminClick} className="text-sm text-blue-600 hover:underline">
            Are you an admin?
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default LoginPage;
