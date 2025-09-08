import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle, Brain, Users, BarChart3, Zap } from "lucide-react";

interface TourModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TourModal = ({ open, onOpenChange }: TourModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const tourSteps = [
    {
      title: "Welcome to CogniCare! 🌟",
      icon: Brain,
      color: "primary",
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <Brain className="h-16 w-16 mx-auto text-primary mb-4 animate-gentle-float" />
            <h3 className="text-xl font-bold mb-2">Advanced Cognitive Retraining Platform</h3>
            <p className="text-muted-foreground leading-relaxed">
              CogniCare combines cutting-edge EEG neurofeedback technology with engaging 
              home-based cognitive training to help children with developmental disabilities 
              improve their cognitive skills.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Available Training</div>
            </div>
            <div className="text-center p-4 bg-therapeutic-green/10 rounded-lg">
              <div className="text-2xl font-bold text-therapeutic-green">95%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Multi-User Platform 👥",
      icon: Users,
      color: "therapeutic-green",
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <Users className="h-16 w-16 mx-auto text-therapeutic-green mb-4" />
            <h3 className="text-xl font-bold mb-2">Designed for Everyone</h3>
            <p className="text-muted-foreground">
              Our platform serves the entire care team with specialized interfaces
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 border border-primary/20 rounded-lg">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-primary">👩‍⚕️</span>
              </div>
              <div>
                <div className="font-semibold">Healthcare Professionals</div>
                <div className="text-sm text-muted-foreground">Patient management, EEG monitoring, clinical analytics</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 border border-therapeutic-green/20 rounded-lg">
              <div className="w-8 h-8 bg-therapeutic-green/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-therapeutic-green">👪</span>
              </div>
              <div>
                <div className="font-semibold">Parents & Caregivers</div>
                <div className="text-sm text-muted-foreground">Progress tracking, home exercises, family support</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 border border-child-purple/20 rounded-lg">
              <div className="w-8 h-8 bg-child-purple/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-child-purple">🎮</span>
              </div>
              <div>
                <div className="font-semibold">Young Learners</div>
                <div className="text-sm text-muted-foreground">Engaging games, rewards, child-friendly interface</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Real-Time Analytics 📊",
      icon: BarChart3,
      color: "child-purple",
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <BarChart3 className="h-16 w-16 mx-auto text-child-purple mb-4" />
            <h3 className="text-xl font-bold mb-2">Advanced Progress Tracking</h3>
            <p className="text-muted-foreground">
              Monitor improvement across all cognitive domains with detailed analytics
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Attention & Focus</span>
                <Badge variant="secondary" className="bg-success/10 text-success">+18%</Badge>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Working Memory</span>
                <Badge variant="secondary" className="bg-success/10 text-success">+22%</Badge>
              </div>
              <Progress value={65} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Problem Solving</span>
                <Badge variant="secondary" className="bg-success/10 text-success">+15%</Badge>
              </div>
              <Progress value={82} className="h-2" />
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <div className="text-sm text-muted-foreground">
              💡 <strong>Smart Insights:</strong> Our AI analyzes patterns to provide 
              personalized recommendations for optimal training schedules and exercises.
            </div>
          </div>
        </div>
      )
    },
    {
      title: "EEG Neurofeedback ⚡",
      icon: Zap,
      color: "warning",
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <Zap className="h-16 w-16 mx-auto text-warning mb-4 animate-pulse" />
            <h3 className="text-xl font-bold mb-2">Real-Time Brain Monitoring</h3>
            <p className="text-muted-foreground">
              Revolutionary EEG integration provides immediate feedback during training
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-lg font-bold text-primary">Alpha Waves</div>
              <div className="text-2xl font-bold">45 μV</div>
              <div className="text-xs text-muted-foreground">Relaxed awareness</div>
            </div>
            <div className="text-center p-4 bg-therapeutic-green/10 rounded-lg">
              <div className="text-lg font-bold text-therapeutic-green">Beta Waves</div>
              <div className="text-2xl font-bold">32 μV</div>
              <div className="text-xs text-muted-foreground">Active thinking</div>
            </div>
          </div>
          
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center">
              <Zap className="h-4 w-4 mr-2 text-warning" />
              Live Neurofeedback
            </h4>
            <p className="text-sm text-muted-foreground">
              Children receive immediate visual and auditory feedback based on their 
              brainwave patterns, helping them learn to regulate their attention and focus.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Get Started! 🚀",
      icon: CheckCircle,
      color: "success",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 mx-auto text-success mb-4" />
            <h3 className="text-xl font-bold mb-2">You're All Set!</h3>
            <p className="text-muted-foreground leading-relaxed">
              You now know the basics of CogniCare. Choose your role to start 
              exploring the platform and begin the cognitive training journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
              <h4 className="font-semibold text-success mb-2">✨ What's Next?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Select your user role from the main page</li>
                <li>• Explore the specialized dashboard features</li>
                <li>• Start with demo content and sample data</li>
                <li>• Contact support for setup assistance</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              🎯 Remember: Each role has unique features designed for your specific needs
            </Badge>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = tourSteps[currentStep];
  const IconComponent = currentStepData.icon;

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    onOpenChange(false);
    setCurrentStep(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <IconComponent className={`h-6 w-6 text-${currentStepData.color}`} />
              <span>{currentStepData.title}</span>
            </DialogTitle>
            <Badge variant="outline">
              Step {currentStep + 1} of {tourSteps.length}
            </Badge>
          </div>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Tour Progress</span>
            <span>{Math.round(((currentStep + 1) / tourSteps.length) * 100)}%</span>
          </div>
          <Progress value={((currentStep + 1) / tourSteps.length) * 100} className="h-2" />
        </div>

        {/* Content */}
        <div className="py-4">
          {currentStepData.content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <div className="flex space-x-2">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? `bg-${currentStepData.color}` : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {currentStep < tourSteps.length - 1 ? (
            <Button
              onClick={nextStep}
              className={`bg-${currentStepData.color} hover:bg-${currentStepData.color}/90 text-white flex items-center space-x-2`}
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={completeTour}
              className="bg-success hover:bg-success/90 text-white flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Start Using CogniCare</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};