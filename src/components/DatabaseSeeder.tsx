import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { seedFirebaseData } from '@/lib/seed-data';
import { toast } from 'sonner';

export const DatabaseSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      await seedFirebaseData();
      setIsSeeded(true);
      toast.success("Database seeded successfully! 🎉", {
        description: "Sample patients, sessions, and reports have been added to Firebase."
      });
    } catch (error) {
      toast.error("Failed to seed database", {
        description: "Please check the console for more details."
      });
      console.error('Seeding error:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
          <Database className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Database Setup</CardTitle>
        <CardDescription>
          Initialize Firebase with sample CogniCare data
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isSeeded ? (
          <>
            <p className="text-sm text-muted-foreground text-center">
              Click below to populate Firebase with sample patients, therapy sessions, KPI metrics, and reports.
            </p>
            
            <Button 
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              className="w-full"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Seed Firebase Database
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="text-center space-y-3">
            <div className="mx-auto p-2 rounded-full bg-success/10 w-fit">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <p className="text-sm font-medium text-success">
              Database seeded successfully!
            </p>
            <p className="text-xs text-muted-foreground">
              You can now explore the app with real Firebase data.
            </p>
          </div>
        )}
        
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <strong>Note:</strong> This will add sample data to your Firebase database. 
              Make sure your Firebase project is properly configured.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
