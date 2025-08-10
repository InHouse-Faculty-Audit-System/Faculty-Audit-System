import React from "react";
import { Shield, Sheet, ExternalLink, LogOut, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();

    const academiaSheetUrl = "https://docs.google.com/spreadsheets/d/1j7K_rI7Fm4m0uscmmUl-lbpT5mS68TvUYq-h1Lo5_34/edit#gid=1954238196";
    const visitScheduleUrl = "https://docs.google.com/spreadsheets/d/1RRKS4xu-jKk0pZE8OPQJFXbKBLXkB8jNosG3E8TzMXk/edit#gid=2077223234";

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-lg border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <Shield className="h-6 w-6 text-blue-600" />
                            <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <User className="h-5 w-5 text-gray-600" />
                                <span className="text-gray-700 font-medium">{user?.name}</span>
                            </div>
                            <button onClick={logout} className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100">
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold mb-6">Sheet Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <a href={academiaSheetUrl} target="_blank" rel="noopener noreferrer" className="block p-6 bg-white rounded-xl shadow border hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Sheet className="h-8 w-8 text-green-600" />
                                <h3 className="text-lg font-semibold">Academia Sheet</h3>
                            </div>
                            <ExternalLink className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-gray-600 mt-2">Manage dates and day orders for the academic calendar.</p>
                    </a>

                    <a href={visitScheduleUrl} target="_blank" rel="noopener noreferrer" className="block p-6 bg-white rounded-xl shadow border hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Sheet className="h-8 w-8 text-blue-600" />
                                <h3 className="text-lg font-semibold">Visit Schedule Sheet</h3>
                            </div>
                            <ExternalLink className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-gray-600 mt-2">Manage faculty audit schedules for each day order.</p>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;