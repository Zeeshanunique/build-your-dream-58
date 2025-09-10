import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Users, Home, BarChart3, Heart, Zap, Shield } from "lucide-react";
import { LandingHero } from "@/components/landing/LandingHero";
import { UserRoleCards } from "@/components/landing/UserRoleCards";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { Dashboard } from "@/components/dashboard/Dashboard";

const Index = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(role || null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!role);

  useEffect(() => {
    if (role && ['therapist', 'parent', 'child'].includes(role)) {
      setSelectedRole(role);
      setIsLoggedIn(true);
    }
  }, [role]);

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

  if (isLoggedIn && selectedRole) {
    return <Dashboard userRole={selectedRole} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-calm-gradient">
      {/* SEO Optimization */}
      <head>
        <title>CogniCare - Cognitive Retraining for Developmental Disabilities</title>
        <meta name="description" content="Advanced cognitive retraining platform combining EEG neurofeedback with home-based training for children with developmental disabilities." />
        <meta name="keywords" content="cognitive retraining, EEG neurofeedback, developmental disabilities, therapy, children" />
        <link rel="canonical" href="/" />
      </head>

      <main>
        <LandingHero />
        <UserRoleCards onRoleSelect={handleRoleSelect} />
        <FeatureShowcase />
        
        {/* Trust Indicators */}
        <section className="py-16 bg-card">
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

      <footer className="bg-foreground text-background py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 CogniCare. Advancing cognitive health through technology.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;