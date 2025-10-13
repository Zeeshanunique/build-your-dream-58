import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Users, Home, BarChart3, Heart, Zap, Shield, LogIn, UserPlus } from "lucide-react";
import { LandingHero } from "@/components/landing/LandingHero";
import { UserRoleCards } from "@/components/landing/UserRoleCards";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const { userProfile, loading: authLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(role || null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!role);

  useEffect(() => {
    if (role && ['therapist', 'parent', 'child'].includes(role)) {
      setSelectedRole(role);
      setIsLoggedIn(true);
    }
  }, [role]);

  useEffect(() => {
    if (userProfile) {
      setSelectedRole(userProfile.role);
      setIsLoggedIn(true);
      // Only redirect if we're not already on a dashboard route
      if (!role) {
        setTimeout(() => {
          navigate(`/dashboard/${userProfile.role}`);
        }, 100);
      }
    }
  }, [userProfile, navigate, role]);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setIsLoggedIn(true);
    navigate(`/dashboard/${role}`);
  };

  const handleLogout = () => {
    setSelectedRole(null);
    setIsLoggedIn(false);
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 mx-auto text-primary animate-gentle-float mb-4" />
          <p className="text-muted-foreground">Loading CogniCare...</p>
        </div>
      </div>
    );
  }

  // Show dashboard if user is logged in and we have a role (either from URL or userProfile)
  if (userProfile && (selectedRole || userProfile.role)) {
    const dashboardRole = selectedRole || userProfile.role;
    return <Dashboard userRole={dashboardRole} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-calm-gradient">
      {/* Navigation Bar */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-foreground">CogniCare</span>
                <div className="text-xs text-muted-foreground">Cognitive Retraining Platform</div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Features
              </a>
              <a href="#about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                About
              </a>
              <a href="#contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <LandingHero />
        <div id="features">
          <UserRoleCards onRoleSelect={handleRoleSelect} />
        </div>
        <FeatureShowcase />
        
        {/* About Section */}
        <section id="about" className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground">Trusted by Healthcare Professionals</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our evidence-based platform is designed in collaboration with therapists, 
                researchers, and families to deliver effective cognitive retraining solutions.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center border-primary-light/20 shadow-card">
                <CardHeader>
                  <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-therapeutic-green">Clinically Validated</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Research-backed cognitive training protocols developed with leading institutions
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center border-primary-light/20 shadow-card">
                <CardHeader>
                  <Heart className="h-12 w-12 text-therapeutic-green mx-auto mb-4" />
                  <CardTitle className="text-primary">Family-Centered</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Designed to support the whole family with tools for parents, therapists, and children
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center border-primary-light/20 shadow-card">
                <CardHeader>
                  <Zap className="h-12 w-12 text-child-purple mx-auto mb-4" />
                  <CardTitle className="text-therapeutic-green">Real-Time Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Advanced EEG integration provides immediate feedback and progress tracking
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
      </main>

      <footer id="contact" className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">CogniCare</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Empowering cognitive development through advanced neurofeedback technology. 
                Trusted by healthcare professionals worldwide.
              </p>
              <div className="flex space-x-4">
                <Button variant="outline" size="sm" className="text-background border-background/20 hover:bg-background/10">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#about" className="hover:text-primary transition-colors">About Us</a></li>
                <li><Link to="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
                <li><Link to="/signup" className="hover:text-primary transition-colors">Sign Up</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-background/20 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 CogniCare. Advancing cognitive health through technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;