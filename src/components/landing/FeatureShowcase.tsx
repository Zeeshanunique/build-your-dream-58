import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, BarChart3, Target, Zap, Users, Shield, Calendar, Award } from "lucide-react";

export const FeatureShowcase = () => {
  const features = [
    {
      icon: Brain,
      title: "Cognitive Training Modules",
      description: "Comprehensive exercises targeting attention, memory, reasoning, and problem-solving skills",
      color: "primary"
    },
    {
      icon: Zap,
      title: "EEG Neurofeedback Integration",
      description: "Real-time brainwave monitoring and feedback to optimize training effectiveness",
      color: "therapeutic-green"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Detailed progress tracking with visual reports and performance insights",
      color: "child-purple"
    },
    {
      icon: Target,
      title: "Personalized Programs",
      description: "Adaptive training protocols customized to each child's specific needs and goals",
      color: "child-orange"
    },
    {
      icon: Users,
      title: "Multi-User Platform",
      description: "Seamless collaboration between therapists, parents, and children",
      color: "primary-light"
    },
    {
      icon: Shield,
      title: "HIPAA Compliant",
      description: "Secure, encrypted platform ensuring patient privacy and data protection",
      color: "success"
    },
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description: "Customizable training schedules that adapt to family routines and needs",
      color: "warning"
    },
    {
      icon: Award,
      title: "Gamified Experience",
      description: "Engaging reward systems and achievements to motivate continued participation",
      color: "child-pink"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-foreground">
            Comprehensive Cognitive Care Platform
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our evidence-based platform combines cutting-edge neurofeedback technology 
            with proven cognitive training methods to deliver measurable results.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={index}
                className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-border/50"
              >
                <CardHeader className="pb-4">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-card w-fit border">
                    <IconComponent className={`h-8 w-8 text-${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg mb-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Process Flow */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">How CogniCare Works</h3>
          
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connection lines for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-therapeutic-green to-child-purple -translate-y-1/2 z-0"></div>
            
            {[
              { step: 1, title: "Initial Assessment", desc: "Comprehensive cognitive evaluation and EEG baseline", icon: "🧠" },
              { step: 2, title: "Custom Protocol", desc: "Personalized training program based on assessment results", icon: "⚙️" },
              { step: 3, title: "Active Training", desc: "Engaging exercises with real-time neurofeedback", icon: "🎯" },
              { step: 4, title: "Progress Tracking", desc: "Continuous monitoring and program adjustments", icon: "📈" }
            ].map((item, index) => (
              <div key={index} className="relative z-10">
                <Card className="text-center bg-card border-primary/20 shadow-card">
                  <CardHeader>
                    <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl border-2 border-primary/20">
                      {item.icon}
                    </div>
                    <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                      {item.step}
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};