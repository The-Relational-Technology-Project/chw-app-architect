
interface AppConfig {
  appName: string;
  description: string;
  forms: Array<{
    name: string;
    purpose: string;
    fields: string[];
  }>;
  tasks: Array<{
    type: string;
    description: string;
    frequency: string;
  }>;
  reports: string[];
}

// Sample configurations for different CHW scenarios
const sampleConfigs: Record<string, AppConfig> = {
  maternal: {
    appName: "Maternal Health Tracker",
    description: "Comprehensive maternal health monitoring and care coordination system for community health workers",
    forms: [
      {
        name: "Pregnancy Registration",
        purpose: "Register new pregnant women in the community",
        fields: ["Full Name", "Age", "Phone Number", "Address", "Last Menstrual Period", "Expected Due Date", "Previous Pregnancies", "Medical History"]
      },
      {
        name: "Antenatal Visit",
        purpose: "Record routine antenatal checkup details",
        fields: ["Visit Date", "Weight", "Blood Pressure", "Fundal Height", "Fetal Heart Rate", "Hemoglobin Level", "Urine Test", "Complaints", "Referral Needed"]
      },
      {
        name: "Birth Registration",
        purpose: "Document birth details and immediate postpartum care",
        fields: ["Birth Date", "Birth Weight", "Delivery Type", "Birth Attendant", "Complications", "Baby Gender", "APGAR Score", "Immunizations Given"]
      }
    ],
    tasks: [
      {
        type: "Appointment Reminder",
        description: "Send SMS reminders for upcoming antenatal visits",
        frequency: "Weekly"
      },
      {
        type: "High-Risk Follow-up",
        description: "Visit pregnant women identified as high-risk cases",
        frequency: "Bi-weekly"
      },
      {
        type: "Iron Supplement Distribution",
        description: "Distribute iron and folic acid supplements to pregnant women",
        frequency: "Monthly"
      }
    ],
    reports: ["Monthly Pregnancy Report", "High-Risk Pregnancies", "Birth Outcomes", "Maternal Mortality Dashboard", "Antenatal Coverage Report"]
  },
  
  vaccination: {
    appName: "Community Immunization Tracker",
    description: "Digital immunization tracking system for community-based vaccination programs",
    forms: [
      {
        name: "Child Registration",
        purpose: "Register children for immunization tracking",
        fields: ["Child Name", "Date of Birth", "Parent/Guardian Name", "Phone Number", "Address", "Birth Weight", "Place of Birth"]
      },
      {
        name: "Vaccination Record",
        purpose: "Record administered vaccines and schedule next doses",
        fields: ["Vaccine Type", "Date Given", "Batch Number", "Site of Injection", "Adverse Events", "Next Due Date", "Healthcare Worker"]
      },
      {
        name: "Missed Appointment Follow-up",
        purpose: "Track and follow up on missed vaccination appointments",
        fields: ["Child Name", "Missed Vaccine", "Reason for Missing", "Follow-up Date", "Rescheduled Date", "Contact Method"]
      }
    ],
    tasks: [
      {
        type: "Vaccination Reminder",
        description: "Send reminders to parents about upcoming vaccinations",
        frequency: "Daily"
      },
      {
        type: "Defaulter Tracing",
        description: "Visit homes of children who missed vaccination appointments",
        frequency: "Weekly"
      },
      {
        type: "Cold Chain Monitoring",
        description: "Check and record vaccine storage temperatures",
        frequency: "Daily"
      }
    ],
    reports: ["Vaccination Coverage Report", "Defaulter List", "Adverse Events Report", "Stock Status Report", "Coverage by Age Group"]
  },

  malaria: {
    appName: "Malaria Case Management System",
    description: "Integrated malaria prevention, diagnosis, and treatment tracking system for community health workers",
    forms: [
      {
        name: "Malaria Case Registration",
        purpose: "Register suspected malaria cases for testing and treatment",
        fields: ["Patient Name", "Age", "Gender", "Address", "Phone Number", "Symptoms", "Fever Duration", "Previous Treatment", "Pregnancy Status"]
      },
      {
        name: "Rapid Diagnostic Test",
        purpose: "Record malaria test results and treatment decisions",
        fields: ["Test Date", "Test Type", "Test Result", "Parasite Species", "Treatment Given", "Dosage Instructions", "Follow-up Date"]
      },
      {
        name: "Bed Net Distribution",
        purpose: "Track distribution of insecticide-treated nets",
        fields: ["Household Head", "Number of Nets", "Distribution Date", "Household Size", "Previous Net Status", "Education Given"]
      }
    ],
    tasks: [
      {
        type: "Active Case Detection",
        description: "Visit households to identify fever cases and test for malaria",
        frequency: "Weekly"
      },
      {
        type: "Treatment Follow-up",
        description: "Follow up with patients receiving malaria treatment",
        frequency: "Day 3 and Day 7"
      },
      {
        type: "Net Distribution Campaign",
        description: "Distribute bed nets during community campaigns",
        frequency: "Seasonal"
      }
    ],
    reports: ["Weekly Malaria Cases", "Treatment Outcomes", "Net Coverage Report", "Test Positivity Rate", "Severe Malaria Referrals"]
  },

  general: {
    appName: "Community Health Management System",
    description: "Comprehensive health management system for community health workers serving diverse health needs",
    forms: [
      {
        name: "Household Registration",
        purpose: "Register households and family members in the catchment area",
        fields: ["Household Head", "Address", "GPS Coordinates", "Phone Number", "Family Members", "Household Size", "Water Source", "Sanitation Facilities"]
      },
      {
        name: "Health Assessment",
        purpose: "Conduct basic health screenings and assessments",
        fields: ["Patient Name", "Age", "Gender", "Chief Complaint", "Vital Signs", "Physical Examination", "Diagnosis", "Treatment Plan", "Referral Status"]
      },
      {
        name: "Health Education Session",
        purpose: "Record community health education activities",
        fields: ["Session Date", "Topic", "Number of Participants", "Location", "Materials Used", "Key Messages", "Questions Asked", "Follow-up Needed"]
      }
    ],
    tasks: [
      {
        type: "Home Visits",
        description: "Conduct routine home visits to check on family health",
        frequency: "Monthly"
      },
      {
        type: "Health Education",
        description: "Organize community health education sessions",
        frequency: "Weekly"
      },
      {
        type: "Data Reporting",
        description: "Submit monthly health reports to district office",
        frequency: "Monthly"
      }
    ],
    reports: ["Monthly Activity Report", "Disease Surveillance", "Health Education Summary", "Referral Tracking", "Household Coverage"]
  }
};

export const generateSampleConfig = (description: string): AppConfig => {
  // Convert description to lowercase for keyword matching
  const lowerDescription = description.toLowerCase();
  
  // Define keywords for different health areas
  const keywords = {
    maternal: ['pregnant', 'pregnancy', 'maternal', 'antenatal', 'birth', 'delivery', 'mother', 'prenatal'],
    vaccination: ['vaccine', 'vaccination', 'immunization', 'immunize', 'shots', 'polio', 'measles', 'bcg'],
    malaria: ['malaria', 'fever', 'mosquito', 'bed net', 'rdt', 'rapid test', 'parasite'],
    general: ['community', 'health', 'household', 'family', 'general', 'clinic', 'patient']
  };
  
  // Find the best matching category
  let bestMatch = 'general';
  let maxMatches = 0;
  
  Object.entries(keywords).forEach(([category, categoryKeywords]) => {
    const matches = categoryKeywords.filter(keyword => lowerDescription.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = category;
    }
  });
  
  // Return the corresponding sample configuration
  return sampleConfigs[bestMatch];
};
