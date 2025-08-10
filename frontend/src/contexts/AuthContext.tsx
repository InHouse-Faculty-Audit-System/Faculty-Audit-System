import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { auditApi } from "../services/api";

// 1. Add 'role' to the User interface
interface User {
  id: string;
  email: string;
  name: string;
  role: 'faculty' | 'admin'; 
}

interface AuditData {
  facultyId: string | null;
  slot: string | null;
  venue: string | null;
  dayOrder: string | null;
  hasAudit: boolean;
}

// 2. Add 'adminLogin' to the context type
interface AuthContextType {
  user: User | null;
  auditData: AuditData | null;
  auditDates: Date[];
  login: (facultyId: string, email: string) => Promise<boolean>;
  adminLogin: (adminId: string, email: string, password: string) => Promise<boolean>; // New function
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [auditDates, setAuditDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAuditDates = async () => {
      // Only fetch audit dates if the user is a faculty member
      if (user && user.role === 'faculty') {
        const res = await auditApi.getAuditDates(user.id);
        if (res.auditDates) {
          const dates = res.auditDates.map((dateStr: string) => {
            const [month, day, year] = dateStr.split('/');
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          });
          setAuditDates(dates);
        }
      }
    };
    fetchAuditDates();
  }, [user]);

  const login = async (facultyId: string, email: string): Promise<boolean> => {
    setIsLoading(true);
    const res = await auditApi.login(facultyId, email);
    setIsLoading(false);

    if (res?.error || (res?.message && res.message !== "Login successful")) {
      return false;
    }
    
    // 3. Set the role to 'faculty' on successful login
    setUser({
      id: res.facultyId,
      email,
      name: res.name || "Faculty", 
      role: 'faculty',
    });

    setAuditData({
      facultyId: res.facultyId,
      slot: res.slot,
      venue: res.venue,
      dayOrder: res.sheetName,
      hasAudit: res.auditToday,
    });

    return true;
  };
  
  // 4. Add the new adminLogin function
  const adminLogin = async (adminId: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    const res = await auditApi.adminLogin(adminId, email, password);
    setIsLoading(false);

    if (res?.error || (res?.message && res.message !== "Admin login successful")) {
      return false;
    }
    
    // Set the user with the 'admin' role
    setUser({
        id: res.user.id,
        email: res.user.email,
        name: res.user.name,
        role: 'admin'
    });
    
    return true;
  };

  const logout = () => {
    setUser(null);
    setAuditData(null);
    setAuditDates([]);
  };

  // 5. Add 'adminLogin' to the provider's value
  return (
    <AuthContext.Provider value={{ user, auditData, auditDates, login, adminLogin, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};