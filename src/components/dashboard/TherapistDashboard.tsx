import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Brain, 
  BarChart3, 
  Calendar, 
  FileText, 
  TrendingUp,
  Activity,
  Clock,
  Target,
  Plus,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";
import { PatientList } from "./PatientList";
import { EEGMonitor } from "./EEGMonitor";
import { AddPatientModal } from "@/components/modals/AddPatientModal";
import { useTherapistKPIs, useOverallKPIs, useAllPatients } from "@/hooks/use-database";
import { usePatients, useReports, useKPIs } from "@/hooks/use-firebase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const TherapistDashboard = () => {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  const { userProfile } = useAuth();
  
  // Use Firebase data if user is authenticated, otherwise fallback to mock data
  const { patients: firebasePatients, loading: firebasePatientsLoading } = usePatients(userProfile?.uid);
  const { reports: firebaseReports, generateReport, updateReport } = useReports(userProfile?.uid);
  const { kpis: firebaseKpis, loading: firebaseKpisLoading } = useKPIs(userProfile?.uid);

  // Fallback to mock data
  const { kpis: therapistKPIs, loading: therapistLoading } = useTherapistKPIs(1);
  const { summary: overallKPIs, loading: overallLoading } = useOverallKPIs();
  const { patients: mockPatients, loading: mockPatientsLoading } = useAllPatients();

  // Use Firebase data if available, otherwise use mock data
  const patients = userProfile?.uid ? firebasePatients : mockPatients;
  const patientsLoading = userProfile?.uid ? firebasePatientsLoading : mockPatientsLoading;
  const kpis = userProfile?.uid ? firebaseKpis : therapistKPIs;
  const kpisLoading = userProfile?.uid ? firebaseKpisLoading : therapistLoading;

  // Calculate dynamic stats from real data
  const stats = [
    { 
      title: "Active Patients", 
      value: patientsLoading ? "..." : patients?.length.toString() || "0", 
      change: "+3", 
      icon: Users, 
      color: "primary" 
    },
    { 
      title: "Sessions This Week", 
      value: kpisLoading ? "..." : kpis?.recentSessions?.toString() || "0", 
      change: "+12%", 
      icon: Calendar, 
      color: "therapeutic-green" 
    },
    { 
      title: "Avg. Improvement", 
      value: kpisLoading ? "..." : kpis?.avgScore ? `${Math.round(kpis.avgScore * 10)}%` : "0%", 
      change: "+5%", 
      icon: TrendingUp, 
      color: "success" 
    },
    { 
      title: "Completion Rate", 
      value: kpisLoading ? "..." : kpis?.completionRate ? `${Math.round(kpis.completionRate)}%` : "0%", 
      change: "+8%", 
      icon: Activity, 
      color: "child-purple" 
    }
  ];

  const handleGenerateReport = async (reportType: string) => {
    if (!userProfile?.uid) {
      toast("Authentication required", {
        description: "Please log in to generate reports"
      });
      return;
    }

    setIsGeneratingReport(true);

    try {
      // Get patient data for the report
      const patientData = selectedPatient
        ? patients?.find(p => p.id === selectedPatient)
        : null;

      // Generate report title with specific patient if selected
      const reportTitle = selectedPatient && patientData
        ? `${patientData.name} - ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`
        : `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;

      // Create report in Firebase
      if (generateReport) {
        const reportId = await generateReport({
          patientId: selectedPatient || "all",
          therapistId: userProfile.uid,
          type: reportType as 'progress' | 'eeg' | 'insurance',
          title: reportTitle,
          status: "generating",
          data: {
            generatedAt: new Date().toISOString(),
            reportType,
            patientId: selectedPatient,
            therapistName: userProfile.name,
            patientName: patientData?.name || "All Patients"
          }
        });

        // Simulate report generation processing
        setTimeout(async () => {
          try {
            // Update report status to ready
            if (updateReport) {
              await updateReport(reportId, {
                status: "ready",
                data: {
                  generatedAt: new Date().toISOString(),
                  reportType,
                  patientId: selectedPatient,
                  therapistName: userProfile.name,
                  patientName: patientData?.name || "All Patients",
                  completed: true
                }
              });
            }

            toast(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully! 📊`, {
              description: "Report is ready for download."
            });
          } catch (updateError) {
            console.error('Error updating report status:', updateError);
            toast("Report generation completed with warnings", {
              description: "Report may be ready for download."
            });
          }
          setIsGeneratingReport(false);
        }, 2000);
      }

    } catch (error) {
      console.error('Error generating report:', error);
      toast("Report generation failed", {
        description: "Please try again or contact support"
      });
      setIsGeneratingReport(false);
    }
  };

  const handleDownloadReport = async (reportName: string, reportData?: Record<string, unknown>) => {
    try {
      // Import jsPDF dynamically
      const { default: jsPDF } = await import('jspdf');

      // Create new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Get real patient data if available
      const getPatientForReport = (patientName: string) => {
        if (userProfile?.uid && patients) {
          return patients.find(p => p.name.includes(patientName));
        }
        return null;
      };
      
      // Helper function to add text with word wrapping
      const addText = (text: string, x: number, y: number, options: {
        fontSize?: number;
        fontStyle?: string;
        color?: string;
        maxWidth?: number;
      } = {}) => {
        const { fontSize = 10, fontStyle = 'normal', color = '#000000', maxWidth = pageWidth - 40 } = options;
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle as any);
        doc.setTextColor(color);

        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * fontSize * 0.4) + 5;
      };
      
      // Helper function to add a section header
      const addSectionHeader = (text: string, y: number) => {
        doc.setFillColor(37, 99, 235); // Blue color
        doc.rect(20, y - 5, pageWidth - 40, 8, 'F');
        return addText(text, 25, y, { fontSize: 12, fontStyle: 'bold', color: '#ffffff' });
      };
      
      // Helper function to add a line
      const addLine = (y: number) => {
        doc.setDrawColor(200, 200, 200);
        doc.line(20, y, pageWidth - 20, y);
        return y + 5;
      };
      
      // Add header
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, pageWidth, 30, 'F');
      addText('COGNICARE CLINICAL PLATFORM', 20, 15, { fontSize: 16, fontStyle: 'bold', color: '#ffffff' });
      addText(reportName, 20, 25, { fontSize: 12, color: '#ffffff' });
      
      yPosition = 40;
      
      // Generate report content based on type
      if (reportName.includes('Progress Summary') || reportName.includes('Emma Rodriguez')) {
        // Patient Information Section
        yPosition = addSectionHeader('PATIENT INFORMATION', yPosition);
        yPosition = addText('Name: Emma Rodriguez', 25, yPosition);
        yPosition = addText('Age: 8 years', 25, yPosition);
        yPosition = addText('Condition: ADHD', 25, yPosition);
        yPosition = addText('Therapist: Dr. Sarah Smith', 25, yPosition);
        yPosition = addText(`Report Date: ${new Date().toLocaleDateString()}`, 25, yPosition);
        yPosition = addText(`Report Time: ${new Date().toLocaleTimeString()}`, 25, yPosition);
        yPosition = addLine(yPosition);
        
        // Executive Summary
        yPosition = addSectionHeader('EXECUTIVE SUMMARY', yPosition);
        yPosition = addText('This report provides a comprehensive overview of Emma Rodriguez\'s cognitive training progress over the past 4 weeks. The patient has shown significant improvement in attention span and task completion rates.', 25, yPosition);
        yPosition = addLine(yPosition);
        
        // Key Performance Indicators
        yPosition = addSectionHeader('KEY PERFORMANCE INDICATORS', yPosition);
        yPosition = addText('• Attention Span: 67% (Baseline: 45%) - +22% improvement', 25, yPosition);
        yPosition = addText('• Task Accuracy: 78% (Baseline: 62%) - +16% improvement', 25, yPosition);
        yPosition = addText('• Reaction Time: 1.2s (Baseline: 2.1s) - 43% faster', 25, yPosition);
        yPosition = addText('• Memory Recall: 82% (Baseline: 68%) - +14% improvement', 25, yPosition);
        yPosition = addText('• Social Interaction: 71% (Baseline: 58%) - +13% improvement', 25, yPosition);
        yPosition = addLine(yPosition);
        
        // Training Sessions
        yPosition = addSectionHeader('TRAINING SESSIONS COMPLETED', yPosition);
        yPosition = addText('Week 1: 3/4 sessions (75% completion)', 25, yPosition);
        yPosition = addText('Week 2: 4/4 sessions (100% completion)', 25, yPosition);
        yPosition = addText('Week 3: 3/4 sessions (75% completion)', 25, yPosition);
        yPosition = addText('Week 4: 4/4 sessions (100% completion)', 25, yPosition);
        yPosition = addText('Total: 14/16 sessions (87.5% completion)', 25, yPosition);
        yPosition = addLine(yPosition);
        
        // EEG Data
        yPosition = addSectionHeader('EEG NEUROFEEDBACK DATA', yPosition);
        yPosition = addText('Alpha Wave Activity: 12.5 Hz (Target: 10-13 Hz) ✓', 25, yPosition);
        yPosition = addText('Beta Wave Activity: 18.2 Hz (Target: 15-20 Hz) ✓', 25, yPosition);
        yPosition = addText('Theta Wave Activity: 6.8 Hz (Target: 4-8 Hz) ✓', 25, yPosition);
        yPosition = addText('Delta Wave Activity: 2.1 Hz (Target: 1-4 Hz) ✓', 25, yPosition);
        yPosition = addLine(yPosition);
        
        // Recommendations
        yPosition = addSectionHeader('RECOMMENDATIONS', yPosition);
        yPosition = addText('1. Continue current training protocol', 25, yPosition);
        yPosition = addText('2. Increase session frequency to 5x per week', 25, yPosition);
        yPosition = addText('3. Introduce advanced attention training modules', 25, yPosition);
        yPosition = addText('4. Schedule follow-up assessment in 2 weeks', 25, yPosition);
        yPosition = addLine(yPosition);
        
        // Therapist Notes
        yPosition = addSectionHeader('THERAPIST NOTES', yPosition);
        yPosition = addText('Emma has shown remarkable progress in her ability to maintain focus during cognitive tasks. Her parents report improved behavior at home and school. The EEG data indicates healthy brainwave patterns consistent with improved attention regulation.', 25, yPosition);
        yPosition = addLine(yPosition);
        
        yPosition = addText('Next Steps:', 25, yPosition);
        yPosition = addText('- Monitor progress for 2 more weeks', 25, yPosition);
        yPosition = addText('- Consider reducing medication dosage if improvement continues', 25, yPosition);
        yPosition = addText('- Plan transition to maintenance program', 25, yPosition);
        
      } else if (reportName.includes('EEG Analysis') || reportName.includes('Lucas Chen')) {
        // Patient Information
        yPosition = addSectionHeader('PATIENT INFORMATION', yPosition);
        yPosition = addText('Name: Lucas Chen', 25, yPosition);
        yPosition = addText('Age: 10 years', 25, yPosition);
        yPosition = addText('Condition: Autism Spectrum Disorder', 25, yPosition);
        yPosition = addText('Therapist: Dr. Sarah Smith', 25, yPosition);
        yPosition = addText(`Report Date: ${new Date().toLocaleDateString()}`, 25, yPosition);
        yPosition = addText(`Report Time: ${new Date().toLocaleTimeString()}`, 25, yPosition);
        yPosition = addLine(yPosition);
        
        // EEG Analysis Summary
        yPosition = addSectionHeader('EEG ANALYSIS SUMMARY', yPosition);
        yPosition = addText('This report provides detailed analysis of Lucas Chen\'s neurofeedback training data collected over 3 weeks of intensive EEG-based cognitive training.', 25, yPosition);
        yPosition = addLine(yPosition);
        
        // Brainwave Analysis
        yPosition = addSectionHeader('BRAINWAVE FREQUENCY ANALYSIS', yPosition);
        yPosition = addText('Alpha Waves (8-13 Hz): 11.2 Hz average', 25, yPosition);
        yPosition = addText('- Baseline: 9.8 Hz | Improvement: +14.3% | Status: Optimal range achieved', 25, yPosition);
        yPosition = addText('Beta Waves (13-30 Hz): 19.5 Hz average', 25, yPosition);
        yPosition = addText('- Baseline: 16.2 Hz | Improvement: +20.4% | Status: Excellent progress', 25, yPosition);
        yPosition = addText('Theta Waves (4-8 Hz): 5.8 Hz average', 25, yPosition);
        yPosition = addText('- Baseline: 7.2 Hz | Improvement: -19.4% (reduction is positive) | Status: Significant improvement', 25, yPosition);
        yPosition = addText('Delta Waves (0.5-4 Hz): 2.3 Hz average', 25, yPosition);
        yPosition = addText('- Baseline: 3.1 Hz | Improvement: -25.8% (reduction is positive) | Status: Excellent regulation', 25, yPosition);
        yPosition = addLine(yPosition);
        
        // Attention Metrics
        yPosition = addSectionHeader('ATTENTION METRICS', yPosition);
        yPosition = addText('Sustained Attention: 78% (Baseline: 52%)', 25, yPosition);
        yPosition = addText('Selective Attention: 71% (Baseline: 48%)', 25, yPosition);
        yPosition = addText('Divided Attention: 65% (Baseline: 41%)', 25, yPosition);
        yPosition = addText('Executive Function: 73% (Baseline: 55%)', 25, yPosition);
        yPosition = addLine(yPosition);
        
        // Cognitive Performance
        yPosition = addSectionHeader('COGNITIVE PERFORMANCE', yPosition);
        yPosition = addText('Working Memory: 82% accuracy', 25, yPosition);
        yPosition = addText('Processing Speed: 1.8s average response', 25, yPosition);
        yPosition = addText('Pattern Recognition: 89% accuracy', 25, yPosition);
        yPosition = addText('Spatial Reasoning: 76% accuracy', 25, yPosition);
        yPosition = addLine(yPosition);
        
        // Training Session Analysis
        yPosition = addSectionHeader('TRAINING SESSION ANALYSIS', yPosition);
        yPosition = addText('Total Sessions: 18', 25, yPosition);
        yPosition = addText('Completed Sessions: 16 (89% completion rate)', 25, yPosition);
        yPosition = addText('Average Session Duration: 25 minutes', 25, yPosition);
        yPosition = addText('Peak Performance Sessions: 12/16 (75%)', 25, yPosition);
        yPosition = addLine(yPosition);
        
        // Recommendations
        yPosition = addSectionHeader('RECOMMENDATIONS', yPosition);
        yPosition = addText('1. Continue current EEG training protocol', 25, yPosition);
        yPosition = addText('2. Increase session duration to 30 minutes', 25, yPosition);
        yPosition = addText('3. Introduce advanced pattern recognition tasks', 25, yPosition);
        yPosition = addText('4. Monitor for any regression in attention metrics', 25, yPosition);
        yPosition = addLine(yPosition);
        
        // Therapist Observations
        yPosition = addSectionHeader('THERAPIST OBSERVATIONS', yPosition);
        yPosition = addText('Lucas has shown exceptional progress in attention regulation and cognitive processing. The EEG data demonstrates significant improvement in brainwave patterns associated with focus and attention. His ability to maintain sustained attention has nearly doubled since beginning the program.', 25, yPosition);
        
      } else {
        // Monthly Cohort Report
        yPosition = addSectionHeader('MONTHLY COHORT REPORT', yPosition);
        yPosition = addText(`Report Period: ${new Date().toLocaleDateString()}`, 25, yPosition);
        yPosition = addText(`Generated: ${new Date().toLocaleTimeString()}`, 25, yPosition);
        yPosition = addText('Therapist: Dr. Sarah Smith', 25, yPosition);
        yPosition = addLine(yPosition);
        
        // Cohort Overview
        yPosition = addSectionHeader('COHORT OVERVIEW', yPosition);
        yPosition = addText('This report provides a comprehensive analysis of all patients in the current treatment cohort, including progress metrics, completion rates, and treatment outcomes.', 25, yPosition);
        yPosition = addLine(yPosition);
        
        // Patient Cohort Summary
        yPosition = addSectionHeader('PATIENT COHORT SUMMARY', yPosition);
        yPosition = addText('Total Patients: 4', 25, yPosition);
        yPosition = addText('Active Patients: 4', 25, yPosition);
        yPosition = addText('Completed Treatment: 0', 25, yPosition);
        yPosition = addText('Average Age: 8.5 years', 25, yPosition);
        yPosition = addText('Primary Conditions: ADHD (50%), Autism Spectrum (25%), Learning Disability (25%)', 25, yPosition);
        yPosition = addLine(yPosition);
        
        // Overall Performance Metrics
        yPosition = addSectionHeader('OVERALL PERFORMANCE METRICS', yPosition);
        yPosition = addText('Average Attention Improvement: +18.5%', 25, yPosition);
        yPosition = addText('Average Task Accuracy: 78.2%', 25, yPosition);
        yPosition = addText('Average Session Completion: 87.3%', 25, yPosition);
        yPosition = addText('Average Treatment Duration: 3.2 weeks', 25, yPosition);
        yPosition = addLine(yPosition);
        
        // Individual Patient Progress
        yPosition = addSectionHeader('INDIVIDUAL PATIENT PROGRESS', yPosition);
        yPosition = addText('1. Emma Rodriguez (ADHD): 67% attention span, 87% completion rate', 25, yPosition);
        yPosition = addText('2. Lucas Chen (ASD): 78% attention span, 89% completion rate', 25, yPosition);
        yPosition = addText('3. Sophia Wilson (LD): 88% attention span, 85% completion rate', 25, yPosition);
        yPosition = addText('4. Noah Miller (ADHD): 98% attention span, 92% completion rate', 25, yPosition);
        yPosition = addLine(yPosition);
        
        // Treatment Effectiveness
        yPosition = addSectionHeader('TREATMENT EFFECTIVENESS', yPosition);
        yPosition = addText('High Responders: 2 patients (50%)', 25, yPosition);
        yPosition = addText('Moderate Responders: 2 patients (50%)', 25, yPosition);
        yPosition = addText('Low Responders: 0 patients (0%)', 25, yPosition);
        yPosition = addLine(yPosition);
        
        // Recommendations
        yPosition = addSectionHeader('RECOMMENDATIONS', yPosition);
        yPosition = addText('1. Continue current treatment protocols', 25, yPosition);
        yPosition = addText('2. Consider group therapy sessions for high responders', 25, yPosition);
        yPosition = addText('3. Implement additional support for moderate responders', 25, yPosition);
        yPosition = addText('4. Plan graduation timeline for top performers', 25, yPosition);
      }
      
      // Add footer
      const footerY = pageHeight - 30;
      doc.setFillColor(240, 240, 240);
      doc.rect(0, footerY, pageWidth, 30, 'F');
      addText('Generated by CogniCare Cognitive Retraining Platform', 20, footerY + 10, { fontSize: 8, color: '#666666' });
      addText(`Report ID: ${reportName.includes('Progress') ? 'CR' : reportName.includes('EEG') ? 'EEG' : 'COHORT'}-${Date.now()}`, 20, footerY + 20, { fontSize: 8, color: '#666666' });
      
      // Save the PDF
      const fileName = `${reportName.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      doc.save(fileName);
      
      toast("Report downloaded successfully! 📄", {
        description: "The PDF report has been saved to your downloads folder."
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast("Failed to generate PDF", {
        description: "Please try again or contact support."
      });
    }
  };

  const recentActivity = [
    { patient: "Emma Rodriguez", action: "Completed Attention Training", time: "2 hours ago", type: "session" },
    { patient: "Lucas Chen", action: "EEG Assessment Scheduled", time: "4 hours ago", type: "appointment" },
    { patient: "Sophia Johnson", action: "Progress Report Generated", time: "6 hours ago", type: "report" },
    { patient: "Mason Williams", action: "Training Protocol Updated", time: "1 day ago", type: "update" }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, Dr. Smith</h1>
          <p className="text-muted-foreground mt-1">
            You have 3 patients scheduled for today and 2 pending assessments.
          </p>
        </div>
        <Button onClick={() => setShowAddPatient(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <IconComponent className={`h-4 w-4 text-${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="text-success font-medium">{stat.change}</span>
                  <span className="ml-1">from last week</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="patients" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patients">Patient Management</TabsTrigger>
          <TabsTrigger value="eeg">EEG Monitoring</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient List */}
            <div className="lg:col-span-2">
              <PatientList onPatientSelect={setSelectedPatient} />
            </div>
            
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'session' ? 'bg-therapeutic-green' :
                      activity.type === 'appointment' ? 'bg-primary' :
                      activity.type === 'report' ? 'bg-child-purple' : 'bg-warning'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{activity.patient}</p>
                      <p className="text-xs text-muted-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="eeg" className="mt-6">
          <EEGMonitor />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Progress Overview</CardTitle>
                <CardDescription>Average improvement across all cognitive domains</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {overallLoading ? (
                  // Loading state
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))
                ) : (
                  [
                    { 
                      domain: "Attention & Focus", 
                      progress: overallKPIs?.avg_attention_span ? Math.min(overallKPIs.avg_attention_span * 4, 100) : 75, 
                      improvement: "+15%" 
                    },
                    { 
                      domain: "Working Memory", 
                      progress: 65, 
                      improvement: "+22%" 
                    },
                    { 
                      domain: "Task Accuracy", 
                      progress: overallKPIs?.avg_accuracy || 80, 
                      improvement: "+18%" 
                    },
                    { 
                      domain: "Task Completion", 
                      progress: overallKPIs?.avg_completion_rate || 71, 
                      improvement: "+12%" 
                    }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{item.domain}</span>
                        <Badge variant="secondary" className="text-success">
                          {item.improvement}
                        </Badge>
                      </div>
                      <Progress value={item.progress} className="h-2" />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Treatment Efficacy</CardTitle>
                <CardDescription>Success rates by intervention type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { name: "EEG Neurofeedback", rate: 89, patients: 18 },
                    { name: "Cognitive Training", rate: 76, patients: 24 },
                    { name: "Combined Therapy", rate: 94, patients: 12 }
                  ].map((treatment, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{treatment.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {treatment.patients} patients
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Progress value={treatment.rate} className="flex-1" />
                        <span className="text-sm font-medium w-12">{treatment.rate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Clinical Reports
                </span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Generate and manage patient progress reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Report Templates */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">Progress Summary</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Comprehensive overview of patient improvements
                          </p>
                          <Button 
                            size="sm" 
                            onClick={() => handleGenerateReport("progress")}
                            disabled={isGeneratingReport}
                          >
                            Generate
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-lg transition-shadow border-therapeutic-green/20">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-therapeutic-green/10 rounded-lg flex items-center justify-center">
                          <BarChart3 className="h-5 w-5 text-therapeutic-green" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">EEG Analysis</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Detailed neurofeedback session data
                          </p>
                          <Button 
                            size="sm" 
                            onClick={() => handleGenerateReport("eeg")}
                            disabled={isGeneratingReport}
                          >
                            Generate
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-lg transition-shadow border-child-purple/20">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-child-purple/10 rounded-lg flex items-center justify-center">
                          <Download className="h-5 w-5 text-child-purple" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">Insurance Report</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Formatted for insurance submissions
                          </p>
                          <Button 
                            size="sm" 
                            onClick={() => handleGenerateReport("insurance")}
                            disabled={isGeneratingReport}
                          >
                            Generate
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Reports */}
                <div className="mt-8">
                  <h4 className="font-medium mb-4">Recent Reports</h4>
                  <div className="space-y-3">
                    {(userProfile?.uid && firebaseReports.length > 0 ? firebaseReports : [
                      { id: "1", title: "Emma Rodriguez - Progress Summary", createdAt: { toDate: () => new Date() }, type: "Progress", status: "ready" },
                      { id: "2", title: "Lucas Chen - EEG Analysis", createdAt: { toDate: () => new Date(Date.now() - 86400000) }, type: "EEG", status: "ready" },
                      { id: "3", title: "Monthly Cohort Report", createdAt: { toDate: () => new Date(Date.now() - 172800000) }, type: "Cohort", status: "generating" }
                    ]).slice(0, 5).map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-sm">{report.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {report.createdAt?.toDate ? report.createdAt.toDate().toLocaleDateString() : "Recent"} • {report.type}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="secondary" 
                            className={report.status === "ready" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}
                          >
                            {report.status === "ready" ? "Ready" : "Processing"}
                          </Badge>
                          {report.status === "ready" && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDownloadReport(report.title)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddPatientModal open={showAddPatient} onOpenChange={setShowAddPatient} />
    </div>
  );
};