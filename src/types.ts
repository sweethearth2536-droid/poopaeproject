export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  heartRate: number;
  bloodPressure: string;
  status: 'normal' | 'special_care';
  history: string;
  specialCare: string;
}

export interface Note {
  id: string;
  patientId: string;
  text: string;
  timeTag: string; // e.g. 'มื้อเช้า', 'มื้อเย็น'
  createdAt: string; // ISO string or Thai date/time string
  caregiverName: string;
}

export interface Medication {
  id: string;
  patientId: string;
  time: string; // e.g. '08:00 น.'
  name: string;
  instructions: string;
  status: 'done' | 'pending' | 'later';
  givenBy?: string;
  givenAt?: string;
}

export interface Schedule {
  id: string;
  patientId: string;
  title: string;
  location: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  notes?: string;
  createdAt?: string;
}

export interface Message {
  id: string;
  senderUid: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  images?: string; // Comma-separated URLs or clean URLs
  timestamp: string; // Thai time string or timestamp or ISO
}

export interface StatusUpdate {
  id: string;
  text: string;
  imageUrl?: string;
  createdAt: string;
  postedBy: string;
}
