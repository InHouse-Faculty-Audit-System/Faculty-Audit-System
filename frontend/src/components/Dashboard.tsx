import React, { useState } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  User,
  Send,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { auditApi } from "../services/api";
import Navbar from "./Navbar";

const calendarStyles = `
  .react-calendar {
    border-radius: 0.75rem; border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  }
  .react-calendar__tile {
    position: relative;
    overflow: visible !important;
  }
  .dot-container {
    display: flex; justify-content: center; align-items: center;
  }
  .audit-dot {
    height: 8px; width: 8px; background-color: #22c55e;
    border-radius: 50%; margin-top: 4px;
  }
  .dot-container .tooltip-text {
    visibility: hidden; width: 120px; background-color: #1f2937;
    color: #fff; text-align: center; border-radius: 6px;
    padding: 5px 0; position: absolute; z-index: 10;
    bottom: 125%; left: 50%; margin-left: -60px;
    opacity: 0; transition: opacity 0.3s;
  }
  .dot-container:hover .tooltip-text {
    visibility: visible; opacity: 1;
  }
`;

const Dashboard: React.FC = () => {
  const { user, auditData, auditDates } = useAuth();
  const [feedback, setFeedback] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [ampm, setAmPm] = useState("PM");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const auditDateStrings = new Set(
    auditDates.map(d => d.toISOString().split('T')[0])
  );

  const handleSubmitFeedback = async () => {
    if (!user || !feedback.trim() || !hour.trim() || !minute.trim()) {
      setError("Please fill in feedback, hour, and minute."); return;
    }
    setError("");
    const formattedHour = hour.padStart(2, '0');
    const formattedMinute = minute.padStart(2, '0');
    const visitTime = `${formattedHour}:${formattedMinute} ${ampm}`;
    setSubmitting(true);
    const res = await auditApi.submitFeedback(user.id, feedback, visitTime);
    setSubmitting(false);
    if (res?.message && res.message.includes("success")) {
      setSubmitted(true);
      setFeedback(""); setHour(""); setMinute(""); setAmPm("PM");
    } else {
      setError(res?.error || res?.message || "Failed to submit feedback");
    }
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || (val >= 1 && val <= 12)) setHour(e.target.value);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || (val >= 0 && val <= 59)) setMinute(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{calendarStyles}</style>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- CORRECTED LAYOUT --- */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>

          {/* Today's Audit Section */}
          {auditData?.hasAudit ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg"><User className="h-6 w-6 text-blue-600" /><div><p className="text-sm text-gray-600">Faculty ID</p><p className="font-semibold">{auditData.facultyId}</p></div></div>
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg"><Clock className="h-6 w-6 text-green-600" /><div><p className="text-sm text-gray-600">Slot</p><p className="font-semibold">{auditData.slot}</p></div></div>
              <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg"><MapPin className="h-6 w-6 text-purple-600" /><div><p className="text-sm text-gray-600">Venue</p><p className="font-semibold">{auditData.venue}</p></div></div>
              <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg"><CalendarIcon className="h-6 w-6 text-orange-600" /><div><p className="text-sm text-gray-600">Day Order</p><p className="font-semibold">{auditData.dayOrder}</p></div></div>
            </div>
          ) : (
            <div className="p-6 bg-white rounded-xl shadow border text-center">
              <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">No audit scheduled for today</p>
            </div>
          )}

          {/* Feedback Section - only shows if there's an audit today */}
          {auditData?.hasAudit && (
            <div className="bg-white p-6 rounded-xl shadow border">
              <h3 className="text-lg font-semibold mb-4">Audit Feedback</h3>
              {submitted ? (
                <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg"><CheckCircle className="h-6 w-6 text-green-600" /><p className="text-green-800">Feedback Submitted Successfully</p></div>
              ) : (
                <>
                  {error && <div className="flex items-center space-x-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg"><AlertTriangle className="h-5 w-5 text-red-500" /><span className="text-red-700 text-sm">{error}</span></div>}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time of Visit</label>
                    <div className="flex items-center space-x-2"><input type="number" value={hour} onChange={handleHourChange} placeholder="HH" min="1" max="12" className="w-20 p-3 border border-gray-300 rounded-lg text-center" /><span className="font-bold">:</span><input type="number" value={minute} onChange={handleMinuteChange} placeholder="MM" min="0" max="59" className="w-20 p-3 border border-gray-300 rounded-lg text-center" /><select value={ampm} onChange={(e) => setAmPm(e.target.value)} className="p-3 border border-gray-300 rounded-lg"><option value="AM">AM</option><option value="PM">PM</option></select></div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">Faculty Remarks</label>
                    <textarea id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Enter your feedback..." className="w-full p-3 border border-gray-300 rounded-lg" rows={4} />
                  </div>
                  <button onClick={handleSubmitFeedback} disabled={submitting} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{submitting ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : <Send className="h-5 w-5" />}<span>{submitting ? "Submitting..." : "Submit Feedback"}</span></button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Calendar Section */}
        <div className="lg:col-span-1">
          <div className="bg-white p-4 rounded-xl shadow border">
            <h3 className="text-lg font-semibold mb-4 text-center">Your Audit Schedule</h3>
            <Calendar
              value={new Date()}
              tileContent={({ date, view }) => {
                const dateString = date.toISOString().split('T')[0];
                if (view === 'month' && auditDateStrings.has(dateString)) {
                  return (
                    <div className="dot-container">
                      <div className="audit-dot"></div>
                      <span className="tooltip-text">Audit this day</span>
                    </div>
                  );
                }
                return null;
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;