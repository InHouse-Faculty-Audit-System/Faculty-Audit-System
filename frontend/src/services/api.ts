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

  submitFeedback: async (facultyId: string, remarks: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facultyId, remarks }),
      });
      return await response.json();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      return { error: "Feedback submission failed due to network error" };
    }
  },
};
