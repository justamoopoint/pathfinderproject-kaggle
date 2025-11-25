import { LogisticsAction } from '../types';

// Mock implementation of the tools defined in the Python script
export const SevaPathTools = {
  findNearestFacility: (location: string, facilityType: string): string => {
    const facilities = [
      "Community Health Center (2.4km)",
      "District Hospital (12km)",
      "City Specialty Clinic (45km)"
    ];
    // Pseudo-random selection based on string length to simulate logic
    const selected = facilities[location.length % facilities.length];
    return `Found: ${selected} near ${location}`;
  },

  bookHomeLab: (testType: string, patientId: string): string => {
    const times = ["09:00 AM", "11:30 AM", "02:00 PM", "04:15 PM"];
    const time = times[patientId.length % times.length];
    return `Confirmed: ${testType} collection scheduled for tomorrow at ${time}. Technician assigned: Rajesh K.`;
  }
};