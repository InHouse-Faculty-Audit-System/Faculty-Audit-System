import React, { createContext, useContext, useState, ReactNode } from "react";
import { auditApi } from "../services/api";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuditData {
  facultyId: string;
  slot: string;
  venue: string;
  dayOrder: string;
  hasAudit: boolean;
}

interface AuthContextType {
  user: User | null;
  auditData: AuditData | null;
  login: (facultyId: string, email: string) => Promise<boolean>;
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
  const [isLoading, setIsLoading] = useState(false);

  const login = async (facultyId: string, email: string): Promise<boolean> => {
    setIsLoading(true);
    const res = await auditApi.login(facultyId, email);
    setIsLoading(false);

    if (res?.error) return false;

    setUser({
      id: res.facultyId,
      email,
      name: res.name || "Faculty",
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

  const logout = () => {
    setUser(null);
    setAuditData(null);
  };

  return (
    <AuthContext.Provider value={{ user, auditData, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
