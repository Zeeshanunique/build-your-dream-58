import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Bell, Settings, User } from "lucide-react";
import { TherapistDashboard } from "./TherapistDashboard";
import { ParentDashboard } from "./ParentDashboard";
import { ChildDashboard } from "./ChildDashboard";
import { toast } from "sonner";

interface DashboardProps {
  userRole: string;
  onLogout: () => void;
}

export const Dashboard = ({ userRole, onLogout }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  const handleLogout = () => {
    toast("Logged out successfully");
    onLogout();
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "therapist": return "Healthcare Professional";
      case "parent": return "Parent/Caregiver";
      case "child": return "Young Learner";
      default: return "User";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "therapist": return "primary";
      case "parent": return "therapeutic-green";
      case "child": return "child-purple";
      default: return "primary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 bg-${getRoleColor(userRole)} rounded-full`}></div>
                <h1 className="text-2xl font-bold text-foreground">CogniCare</h1>
              </div>
              <div className={`px-3 py-1 bg-${getRoleColor(userRole)}/10 text-${getRoleColor(userRole)} rounded-full text-sm font-medium`}>
                {getRoleDisplayName(userRole)}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="ml-2"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {userRole === "therapist" && <TherapistDashboard />}
        {userRole === "parent" && <ParentDashboard />}
        {userRole === "child" && <ChildDashboard />}
      </main>
    </div>
  );
};