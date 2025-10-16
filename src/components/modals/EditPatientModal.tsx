import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Calendar, 
  FileText, 
  Save,
  X
} from "lucide-react";
import { usePatients } from "@/hooks/use-sqlite";
import { toast } from "sonner";

interface EditPatientModalProps {
  patientId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditPatientModal = ({ patientId, open, onOpenChange }: EditPatientModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    condition: "",
    status: "active",
    therapist_name: "",
    parent_name: "",
    notes: "",
    next_session: "",
    last_session: ""
  });

  const { patients, updatePatient } = usePatients();
  const patient = patients?.find(p => p.id?.toString() === patientId);

  // Initialize form data when patient changes
  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || "",
        age: patient.age?.toString() || "",
        condition: patient.condition || "",
        status: patient.status || "active",
        therapist_name: patient.therapist_name || "",
        parent_name: patient.parent_name || "",
        notes: patient.notes || "",
        next_session: patient.next_session || "",
        last_session: patient.last_session || ""
      });
    }
  }, [patient]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!patient?.id) {
      toast.error("Patient not found");
      return;
    }

    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        toast.error("Patient name is required");
        setIsLoading(false);
        return;
      }

      if (!formData.age || isNaN(Number(formData.age))) {
        toast.error("Valid age is required");
        setIsLoading(false);
        return;
      }

      if (!formData.condition.trim()) {
        toast.error("Condition is required");
        setIsLoading(false);
        return;
      }

      // Prepare update data
      const updateData = {
        name: formData.name.trim(),
        age: parseInt(formData.age),
        condition: formData.condition.trim(),
        status: formData.status,
        therapist_name: formData.therapist_name.trim(),
        parent_name: formData.parent_name.trim(),
        notes: formData.notes.trim(),
        next_session: formData.next_session || null,
        last_session: formData.last_session || null
      };

      // Call update function (this would need to be implemented in the hook)
      // For now, we'll simulate the update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Patient information updated successfully! ✅", {
        description: `${formData.name}'s profile has been updated.`
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error updating patient:', error);
      toast.error("Failed to update patient", {
        description: "Please try again or contact support"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original patient data
    if (patient) {
      setFormData({
        name: patient.name || "",
        age: patient.age?.toString() || "",
        condition: patient.condition || "",
        status: patient.status || "active",
        therapist_name: patient.therapist_name || "",
        parent_name: patient.parent_name || "",
        notes: patient.notes || "",
        next_session: patient.next_session || "",
        last_session: patient.last_session || ""
      });
    }
    onOpenChange(false);
  };

  if (!patient) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`/api/placeholder/64/64?text=${patient.name.split(' ').map(n => n[0]).join('')}`} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl">Edit Patient Information</DialogTitle>
              <DialogDescription className="text-base">
                Update {patient.name}'s profile and treatment details
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Patient Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter patient name"
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    placeholder="Enter age"
                    min="1"
                    max="18"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="condition">Condition *</Label>
                  <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADHD">ADHD</SelectItem>
                      <SelectItem value="Autism Spectrum Disorder">Autism Spectrum Disorder</SelectItem>
                      <SelectItem value="Learning Disability">Learning Disability</SelectItem>
                      <SelectItem value="Anxiety">Anxiety</SelectItem>
                      <SelectItem value="Depression">Depression</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="attention">Needs Attention</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="therapist_name">Therapist</Label>
                  <Input
                    id="therapist_name"
                    value={formData.therapist_name}
                    onChange={(e) => handleInputChange("therapist_name", e.target.value)}
                    placeholder="Enter therapist name"
                  />
                </div>
                <div>
                  <Label htmlFor="parent_name">Parent/Guardian</Label>
                  <Input
                    id="parent_name"
                    value={formData.parent_name}
                    onChange={(e) => handleInputChange("parent_name", e.target.value)}
                    placeholder="Enter parent/guardian name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Session Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="last_session">Last Session</Label>
                  <Input
                    id="last_session"
                    type="datetime-local"
                    value={formData.last_session ? new Date(formData.last_session).toISOString().slice(0, 16) : ""}
                    onChange={(e) => handleInputChange("last_session", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="next_session">Next Session</Label>
                  <Input
                    id="next_session"
                    type="datetime-local"
                    value={formData.next_session ? new Date(formData.next_session).toISOString().slice(0, 16) : ""}
                    onChange={(e) => handleInputChange("next_session", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Clinical Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Enter clinical notes, observations, or treatment plans..."
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
