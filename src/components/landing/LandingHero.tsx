import { Button } from "@/components/ui/button";
import { Brain, ArrowRight, Play } from "lucide-react";
import { useState } from "react";
import { DemoModal } from "@/components/modals/DemoModal";

export const LandingHero = () => {
  const [showDemo, setShowDemo] = useState(false);

  const scrollToRoles = () => {
    document.getElementById('user-roles')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-therapeutic-gradient opacity-10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Animated Logo */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <Brain className="h-20 w-20 text-primary animate-gentle-float" />
              <div className="absolute -top-2 -right-2 h-6 w-6 bg-therapeutic-green rounded-full animate-pulse"></div>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-therapeutic-green bg-clip-text text-transparent leading-tight">
            CogniCare
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-foreground">
            Advanced Cognitive Retraining Platform
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
            Combining EEG neurofeedback technology with home-based cognitive training 
            to improve attention, memory, reasoning, and problem-solving skills for 
            children with developmental disabilities.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              onClick={scrollToRoles}
              className="bg-primary hover:bg-primary-dark text-white px-8 py-4 text-lg shadow-therapeutic group"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setShowDemo(true)}
              className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 text-lg"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Key Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="text-center p-6 rounded-xl bg-card/50 backdrop-blur border border-primary-light/20">
              <div className="h-12 w-12 bg-primary-light/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">Personalized Training</h3>
              <p className="text-muted-foreground text-sm">
                Adaptive exercises tailored to each child's unique cognitive profile and progress
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-card/50 backdrop-blur border border-therapeutic-green/20">
              <div className="h-12 w-12 bg-therapeutic-green-light/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">Real-Time Monitoring</h3>
              <p className="text-muted-foreground text-sm">
                EEG integration provides immediate feedback and detailed progress analytics
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-card/50 backdrop-blur border border-child-purple/20">
              <div className="h-12 w-12 bg-child-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">Home-Based Care</h3>
              <p className="text-muted-foreground text-sm">
                Convenient at-home training with family involvement and professional support
              </p>
            </div>
          </div>
        </div>
      </div>

      <DemoModal open={showDemo} onOpenChange={setShowDemo} />
    </section>
  );
};