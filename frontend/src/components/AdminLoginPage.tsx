import React, { useState } from "react";
import { Mail, User, KeyRound, LogIn, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface AdminLoginPageProps {
  onBack: () => void; // Function to go back to the faculty login
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onBack }) => {
  const [email, setEmail] = useState("");
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { adminLogin, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !adminId || !password) {
      setError("Please fill in all fields");
      return;
    }

    const success = await adminLogin(adminId, email, password);
    if (!success) {
      setError("Invalid admin credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Panel
          </h2>
          <p className="text-gray-600">Sign in with your admin account</p>
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
              <label htmlFor="adminId" className="block text-sm font-medium text-gray-700 mb-2">Admin ID</label>
              <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-gray-400" /></div><input id="adminId" type="text" required value={adminId} onChange={(e) => setAdminId(e.target.value)} className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your admin ID" /></div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div><input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your email" /></div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><KeyRound className="h-5 w-5 text-gray-400" /></div><input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your password" /></div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
              {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> : <><LogIn className="h-5 w-5" /><span>Login</span></>}
            </button>
          </form>
        </div>
        <div className="text-center">
            <button onClick={onBack} className="text-sm text-blue-600 hover:underline flex items-center justify-center mx-auto">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Faculty Login
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;