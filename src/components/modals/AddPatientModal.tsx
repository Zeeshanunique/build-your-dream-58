import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePatients } from "@/hooks/use-sqlite";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AddPatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddPatientModal = ({ open, onOpenChange }: AddPatientModalProps) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    condition: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { userProfile } = useAuth();
  const { createPatient } = usePatients();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userProfile?.id) {
      toast("Authentication required", {
        description: "Please log in to add patients"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create new patient in SQLite
      await createPatient({
        name: `${formData.firstName} ${formData.lastName}`,
        age: parseInt(formData.age),
        condition: formData.condition === 'adhd' ? 'ADHD' :
                  formData.condition === 'autism' ? 'Autism Spectrum Disorder' :
                  formData.condition === 'learning-disability' ? 'Learning Disability' :
                  formData.condition === 'processing-disorder' ? 'Processing Disorder' :
                  formData.condition === 'memory-difficulties' ? 'Memory Difficulties' :
                  'Other',
        therapist_id: userProfile.id,
        parent_id: 1, // Default parent ID for now
        notes: formData.notes
      });

      toast("New patient added successfully! 🎉", {
        description: `${formData.firstName} ${formData.lastName} has been added to your patient list.`
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        age: "",
        condition: "",
        parentName: "",
        parentEmail: "",
        parentPhone: "",
        notes: ""
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error adding patient:', error);
      toast("Failed to add patient", {
        description: "Please try again or contact support"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-primary">
            👩‍⚕️ Add New Patient
          </DialogTitle>
          <DialogDescription>
            Enter the patient information to create a new cognitive training profile.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground border-b pb-2">Patient Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  min="3"
                  max="18"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  placeholder="Age"
                  required
                />
              </div>
              <div>
                <Label htmlFor="condition">Primary Condition *</Label>
                <Select onValueChange={(value) => handleInputChange("condition", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adhd">ADHD</SelectItem>
                    <SelectItem value="autism">Autism Spectrum Disorder</SelectItem>
                    <SelectItem value="learning-disability">Learning Disability</SelectItem>
                    <SelectItem value="processing-disorder">Processing Disorder</SelectItem>
                    <SelectItem value="memory-difficulties">Memory Difficulties</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Parent/Guardian Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground border-b pb-2">Parent/Guardian Information</h3>
            
            <div>
              <Label htmlFor="parentName">Parent/Guardian Name *</Label>
              <Input
                id="parentName"
                value={formData.parentName}
                onChange={(e) => handleInputChange("parentName", e.target.value)}
                placeholder="Full name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parentEmail">Email *</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="parentPhone">Phone Number</Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <Label htmlFor="notes">Clinical Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any additional information about the patient's condition, goals, or special considerations..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Patient"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};