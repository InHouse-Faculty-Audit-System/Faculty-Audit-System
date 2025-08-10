const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 

export const auditApi = {
  login: async (facultyId: string, email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facultyId, email }),
      });
      return await response.json(); 
    } catch (error) {
      console.error("Error during login:", error);
      return { error: "Login failed due to network error" };
    }
  },
  //Calender API
  getAuditDates: async (facultyId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/audits/${facultyId}`);
      if (!response.ok) {
        return { error: "Failed to fetch audit dates" };
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching audit dates:", error);
      return { error: "Network error while fetching audit dates" };
    }
  },
  // Admin login API
   adminLogin: async (adminId: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, email, password }),
      });
      return await response.json();
    } catch (error) {
      console.error("Error during admin login:", error);
      return { error: "Admin login failed due to network error" };
    }
  },

  submitFeedback: async (facultyId: string, feedback: string, visitTime: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faculty_id: facultyId, feedback, visitTime }),
      });
      return await response.json();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      return { error: "Feedback submission failed due to network error" };
    }
  },
};
