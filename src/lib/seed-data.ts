import { firebaseService } from './firebase-service';
import { Timestamp } from 'firebase/firestore';

// Sample data for CogniCare
export const seedFirebaseData = async () => {
  try {
    console.log('Starting to seed Firebase with sample data...');

    // Sample patients
    const samplePatients = [
      {
        name: "Emma Rodriguez",
        age: 8,
        condition: "ADHD",
        progress: 78,
        trend: "improving" as const,
        status: "active" as const,
        lastSession: "2 days ago",
        nextSession: "Tomorrow 2:00 PM",
        completedSessions: 12,
        totalSessions: 20
      },
      {
        name: "Lucas Chen",
        age: 10,
        condition: "Autism Spectrum",
        progress: 65,
        trend: "stable" as const,
        status: "active" as const,
        lastSession: "1 week ago",
        nextSession: "Friday 10:00 AM",
        completedSessions: 8,
        totalSessions: 16
      },
      {
        name: "Sophia Johnson",
        age: 7,
        condition: "Learning Disability",
        progress: 82,
        trend: "improving" as const,
        status: "active" as const,
        lastSession: "3 days ago",
        nextSession: "Monday 3:00 PM",
        completedSessions: 15,
        totalSessions: 18
      },
      {
        name: "Mason Williams",
        age: 9,
        condition: "Processing Disorder",
        progress: 71,
        trend: "improving" as const,
        status: "active" as const,
        lastSession: "1 day ago",
        nextSession: "Thursday 11:00 AM",
        completedSessions: 10,
        totalSessions: 15
      }
    ];

    // Add patients to Firebase
    const patientIds: string[] = [];
    for (const patient of samplePatients) {
      const patientId = await firebaseService.addPatient(patient);
      patientIds.push(patientId);
      console.log(`Added patient: ${patient.name} with ID: ${patientId}`);
    }

    // Sample KPI metrics for each patient
    for (let i = 0; i < patientIds.length; i++) {
      const patientId = patientIds[i];
      
      // Generate 5 sample KPI records for each patient
      for (let j = 0; j < 5; j++) {
        const kpiData = {
          patientId,
          sessionId: `session_${patientId}_${j}`,
          attentionSpan: Math.floor(Math.random() * 20) + 10, // 10-30 minutes
          workingMemory: Math.floor(Math.random() * 40) + 60, // 60-100%
          processingSpeed: Math.floor(Math.random() * 30) + 70, // 70-100%
          accuracy: Math.floor(Math.random() * 20) + 80, // 80-100%
          completionRate: Math.floor(Math.random() * 15) + 85, // 85-100%
          date: Timestamp.fromDate(new Date(Date.now() - (j * 7 * 24 * 60 * 60 * 1000))) // Weekly intervals
        };
        
        await firebaseService.addKPIMetrics(kpiData);
      }
      console.log(`Added KPI metrics for patient ${i + 1}`);
    }

    // Sample therapy sessions
    for (let i = 0; i < patientIds.length; i++) {
      const patientId = patientIds[i];
      const therapistId = "therapist_demo_001"; // Demo therapist ID
      
      // Generate 3 sample sessions for each patient
      for (let j = 0; j < 3; j++) {
        const sessionData = {
          patientId,
          therapistId,
          date: Timestamp.fromDate(new Date(Date.now() - (j * 3 * 24 * 60 * 60 * 1000))), // Every 3 days
          duration: Math.floor(Math.random() * 30) + 30, // 30-60 minutes
          type: ['cognitive', 'eeg', 'combined'][Math.floor(Math.random() * 3)] as 'cognitive' | 'eeg' | 'combined',
          status: 'completed' as const,
          notes: `Session ${j + 1} completed successfully. Patient showed good engagement and progress.`,
          metrics: {
            attentionSpan: Math.floor(Math.random() * 20) + 10,
            accuracy: Math.floor(Math.random() * 20) + 80,
            completionRate: Math.floor(Math.random() * 15) + 85
          }
        };
        
        await firebaseService.addSession(sessionData);
      }
      console.log(`Added therapy sessions for patient ${i + 1}`);
    }

    // Sample EEG readings
    for (let i = 0; i < patientIds.length; i++) {
      const patientId = patientIds[i];
      const sessionId = `session_${patientId}_eeg`;
      
      // Generate 10 sample EEG readings for each patient
      for (let j = 0; j < 10; j++) {
        const eegData = {
          patientId,
          sessionId,
          timestamp: Timestamp.fromDate(new Date(Date.now() - (j * 60 * 1000))), // Every minute
          alpha: Math.random() * 50 + 25, // 25-75 μV
          beta: Math.random() * 30 + 15, // 15-45 μV
          theta: Math.random() * 40 + 20, // 20-60 μV
          delta: Math.random() * 80 + 40, // 40-120 μV
          gamma: Math.random() * 10 + 5 // 5-15 μV
        };
        
        await firebaseService.addEEGReading(eegData);
      }
      console.log(`Added EEG readings for patient ${i + 1}`);
    }

    // Sample reports
    const sampleReports = [
      {
        patientId: patientIds[0],
        therapistId: "therapist_demo_001",
        type: "progress" as const,
        title: "Emma Rodriguez - Monthly Progress Report",
        status: "ready" as const,
        data: {
          summary: "Excellent progress in attention span and working memory",
          improvements: ["25% increase in attention span", "Improved task completion rate"],
          recommendations: ["Continue current protocol", "Increase session frequency"]
        }
      },
      {
        patientId: patientIds[1],
        therapistId: "therapist_demo_001",
        type: "eeg" as const,
        title: "Lucas Chen - EEG Analysis Report",
        status: "ready" as const,
        data: {
          summary: "EEG patterns show positive response to neurofeedback",
          findings: ["Increased alpha wave activity", "Reduced theta/beta ratio"],
          recommendations: ["Continue neurofeedback sessions", "Monitor weekly progress"]
        }
      },
      {
        patientId: patientIds[2],
        therapistId: "therapist_demo_001",
        type: "insurance" as const,
        title: "Sophia Johnson - Insurance Claim Report",
        status: "generating" as const,
        data: null
      }
    ];

    for (const report of sampleReports) {
      await firebaseService.generateReport(report);
      console.log(`Added report: ${report.title}`);
    }

    console.log('✅ Firebase seeding completed successfully!');
    console.log(`✅ Added ${patientIds.length} patients`);
    console.log(`✅ Added ${patientIds.length * 5} KPI records`);
    console.log(`✅ Added ${patientIds.length * 3} therapy sessions`);
    console.log(`✅ Added ${patientIds.length * 10} EEG readings`);
    console.log(`✅ Added ${sampleReports.length} reports`);

  } catch (error) {
    console.error('❌ Error seeding Firebase:', error);
    throw error;
  }
};

// Function to clear all data (useful for testing)
export const clearFirebaseData = async () => {
  console.log('⚠️ This would clear all Firebase data. Implement with caution!');
  // Implementation would require admin SDK or careful batch deletes
};
