import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, Home, Gamepad2, LogIn } from "lucide-react";

interface UserRoleCardsProps {
  onRoleSelect: (role: string) => void;
}

export const UserRoleCards = ({ onRoleSelect }: UserRoleCardsProps) => {
  const roles = [
    {
      id: "therapist",
      title: "Healthcare Professional",
      description: "Monitor patient progress, customize training programs, and analyze EEG data",
      icon: UserCheck,
      color: "primary",
      features: [
        "Patient management dashboard",
        "EEG data analysis tools",
        "Custom training protocols",
        "Progress reporting",
        "Clinical documentation"
      ]
    },
    {
      id: "parent",
      title: "Parent / Caregiver",
      description: "Support your child's cognitive development with guided home training",
      icon: Home,
      color: "therapeutic-green",
      features: [
        "Child progress tracking",
        "Home exercise guidance",
        "Communication with therapists",
        "Training reminders",
        "Family resources"
      ]
    },
    {
      id: "child",
      title: "Young Learner",
      description: "Fun, engaging cognitive exercises designed specifically for children",
      icon: Gamepad2,
      color: "child-purple",
      features: [
        "Interactive games & exercises",
        "Reward system",
        "Age-appropriate interface",
        "Voice guidance",
        "Progress celebrations"
      ]
    }
  ];

  return (
    <section id="user-roles" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-foreground">
            Choose Your Role
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            CogniCare is designed to serve the entire care team. Select your role to access 
            personalized tools and interfaces tailored to your specific needs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <Card 
                key={role.id}
                className={`relative overflow-hidden border-2 hover:border-${role.color} transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group cursor-pointer`}
                onClick={() => onRoleSelect(role.id)}
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-${role.color}`}></div>
                
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto mb-4 p-4 rounded-full bg-${role.color}/10 w-fit group-hover:scale-110 transition-transform`}>
                    <IconComponent className={`h-8 w-8 text-${role.color}`} />
                  </div>
                  <CardTitle className="text-xl mb-2">{role.title}</CardTitle>
                  <CardDescription className="text-base">
                    {role.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3 mb-6">
                    {role.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <div className={`w-2 h-2 rounded-full bg-${role.color} mr-3 flex-shrink-0`}></div>
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={`w-full bg-${role.color} hover:bg-${role.color}/90 text-white group-hover:shadow-lg transition-all`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRoleSelect(role.id);
                    }}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Enter as {role.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            New to CogniCare? Learn more about our platform
          </p>
          <Button variant="outline" size="lg">
            Take Platform Tour
          </Button>
        </div>
      </div>
    </section>
  );
};