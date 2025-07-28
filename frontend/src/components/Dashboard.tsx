import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  User,
  FileText,
  Send,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { auditApi } from "../services/api";
import Navbar from "./Navbar";

const Dashboard: React.FC = () => {
  const { user, auditData } = useAuth();
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmitFeedback = async () => {
    if (!user || !feedback.trim()) return;

    setSubmitting(true);
    const res = await auditApi.submitFeedback(user.id, feedback);
    setSubmitting(false);

    if (res?.message) {
      setSubmitted(true);
      setFeedback("");
    } else {
      setError(res?.error || "Failed to submit feedback");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome back, {user?.name}</p>

        {auditData?.hasAudit ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Faculty ID</p>
                  <p className="font-semibold">{auditData.facultyId}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Slot</p>
                  <p className="font-semibold">{auditData.slot}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                <MapPin className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Venue</p>
                  <p className="font-semibold">{auditData.venue}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Day Order</p>
                  <p className="font-semibold">{auditData.dayOrder}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow border">
              <h3 className="text-lg font-semibold mb-4">Audit Feedback</h3>
              {submitted ? (
                <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <p className="text-green-800">
                    Feedback Submitted Successfully
                  </p>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="flex items-center space-x-2 mb-3 text-red-600">
                      <FileText className="h-5 w-5" />
                      <span>{error}</span>
                    </div>
                  )}
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Enter your feedback..."
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                  />
                  <button
                    onClick={handleSubmitFeedback}
                    disabled={submitting || !feedback.trim()}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                    <span>
                      {submitting ? "Submitting..." : "Submit Feedback"}
                    </span>
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="p-6 bg-white rounded-xl shadow text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-2" />
            <p className="font-semibold text-gray-700">
              No audit scheduled for today
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
