export interface EmailInput {
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
}

export type CategoryId =
  | "admissions"
  | "student_support"
  | "academic"
  | "administrative"
  | "medical"
  | "engineering";

export interface RoutingResult {
  emailId: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
  category: CategoryId;
  categoryLabel: string;
  confidence: number;
  campusId: string;
  campusName: string;
  agentName: string;
  faculty: string;
  reasoning: string;
  draftReply: string;
  processedAt: string;
  processingSteps: ProcessingStep[];
  status: "draft" | "sent";
}

export interface ProcessingStep {
  label: string;
  detail: string;
  doneAt: number; // ms delay
}

export interface ActivityEvent {
  id: string;
  type: "routed" | "replied" | "escalated" | "received";
  agentName: string;
  campusId: string;
  campusColor: string;
  subject: string;
  category: string;
  timestamp: string;
}

export interface CampusStats {
  campusId: string;
  total: number;
  admissions: number;
  student_support: number;
  academic: number;
  administrative: number;
  medical: number;
  engineering: number;
}
