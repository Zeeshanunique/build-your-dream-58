import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Brain } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-calm-gradient">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <Brain className="h-20 w-20 text-primary animate-gentle-float" />
            <div className="absolute -top-2 -right-2 h-6 w-6 bg-child-purple rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-therapeutic-green bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-2xl font-semibold mb-4 text-foreground">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Oops! The page you're looking for seems to have wandered off. 
          Let's get you back to your cognitive training journey.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => window.history.back()}
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          
          <Button 
            onClick={() => window.location.href = "/"}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            <Home className="mr-2 h-4 w-4" />
            Return Home
          </Button>
        </div>
        
        <div className="mt-12 p-4 bg-card/50 backdrop-blur border border-primary-light/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Need help?</strong> Contact our support team or explore our 
            cognitive training programs from the homepage.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
