// UMU campus and faculty data
export const CAMPUSES = [
  {
    id: "nkozi",
    name: "Nkozi Campus",
    short: "NKZ",
    location: "Main Campus, 83km Kampala–Masaka Hwy",
    email: "registrar@umu.ac.ug",
    admissionsEmail: "admissions@umu.ac.ug",
    ccEmail: "registrar@umu.ac.ug",
    agentName: "NkoziBot",
    color: "#F5A623",
    faculties: [
      "Faculty of Agriculture",
      "Faculty of Business Administration and Management",
      "Faculty of the Built Environment",
      "Faculty of Education",
      "Faculty of Science",
      "School of Arts and Social Sciences",
      "Faculty of Law",
      "Graduate Studies",
    ],
    status: "online",
  },
  {
    id: "lubaga",
    name: "Lubaga Campus",
    short: "LBG",
    location: "Near Lubaga Cathedral, Kampala",
    email: "coordinatorlubaga@umu.ac.ug",
    admissionsEmail: "coordinatorlubaga@umu.ac.ug",
    ccEmail: "coordinatorlubaga@umu.ac.ug",
    agentName: "LubagaBot",
    color: "#29ABE2",
    faculties: [
      "Faculty of Agriculture (Masters)",
      "Faculty of Business Administration",
      "Faculty of Education",
      "Faculty of Health Sciences",
      "Faculty of Science (ICT/CS)",
      "School of Arts and Social Sciences",
      "Faculty of Law",
    ],
    status: "online",
  },
  {
    id: "nsambya",
    name: "Nsambya Campus",
    short: "NSB",
    location: "Opposite Nsambya Parish, Kampala",
    email: "pgmnsambya@umu.ac.ug",
    admissionsEmail: "pgmnsambya@umu.ac.ug",
    ccEmail: "pgmnsambya@umu.ac.ug",
    agentName: "NsambyaBot",
    color: "#E74C3C",
    faculties: [
      "Mother Kevin Postgraduate Medical School",
      "Faculty of Health Sciences",
    ],
    status: "online",
  },
  {
    id: "fortportal",
    name: "Fort Portal Campus",
    short: "FTP",
    location: "Virika, Fort Portal, Western Uganda",
    email: "directorfp@umu.ac.ug",
    admissionsEmail: "directorfp@umu.ac.ug",
    ccEmail: "directorfp@umu.ac.ug",
    agentName: "FortPortalBot",
    color: "#27AE60",
    faculties: [
      "Faculty of Agriculture",
      "Faculty of Business Administration",
      "Faculty of Education",
      "Faculty of Health Sciences",
      "Faculty of Engineering and Applied Sciences",
    ],
    status: "online",
  },
  {
    id: "masaka",
    name: "Masaka Campus",
    short: "MSK",
    location: "Bwala Social Centre, Masaka",
    email: "umumasaka@umu.ac.ug",
    admissionsEmail: "umumasaka@umu.ac.ug",
    ccEmail: "umumasaka@umu.ac.ug",
    agentName: "MasakaBot",
    color: "#9B59B6",
    faculties: [
      "Faculty of Business Administration",
      "Faculty of Education",
      "Faculty of Science",
      "School of Arts and Social Sciences",
      "Faculty of Law",
    ],
    status: "online",
  },
  {
    id: "ngetta",
    name: "Ngetta Campus",
    short: "NGT",
    location: "Former Ngetta TTC, Lira, Northern Uganda",
    email: "directorngetta@umu.ac.ug",
    admissionsEmail: "directorngetta@umu.ac.ug",
    ccEmail: "directorngetta@umu.ac.ug",
    agentName: "NgettaBot",
    color: "#E67E22",
    faculties: [
      "Faculty of Agriculture",
      "Faculty of Business Administration",
      "Faculty of Education",
      "School of Arts and Social Sciences",
    ],
    status: "online",
  },
  {
    id: "mbale",
    name: "Mbale Campus",
    short: "MBL",
    location: "St. Austin Mbale, Eastern Uganda",
    email: "jkmusisi@umu.ac.ug",
    admissionsEmail: "jkmusisi@umu.ac.ug",
    ccEmail: "jkmusisi@umu.ac.ug",
    agentName: "MbaleBot",
    color: "#1ABC9C",
    faculties: [
      "Faculty of Business Administration",
      "Faculty of Education",
      "School of Arts and Social Sciences",
    ],
    status: "idle",
  },
];

// Escalation thresholds
export const ESCALATION_CONFIDENCE_THRESHOLD = 70;
export const ESCALATION_CATEGORIES = ["administrative"];

// Dean / VC escalation contacts
export const UMU_ESCALATION_CONTACTS = {
  deanOfStudies: "deanofstudies@umu.ac.ug",
  vc: "vc@umu.ac.ug",
  registrar: "registrar@umu.ac.ug",
};

// UMU Key Staff Contacts (for CC/BCC in email routing)
export const UMU_KEY_CONTACTS = {
  registrar: "registrar@umu.ac.ug",
  admissions: "admissions@umu.ac.ug",
  pr: "pro@umu.ac.ug",
  graduateStudies: "dgsre@umu.ac.ug",
  // Vice Chancellor's office — standard institutional format (confirm with UMU IT)
  vc: "vc@umu.ac.ug",
  vcOffice: "vcoffice@umu.ac.ug",
};

// Helper: build a mailto: URL that pre-fills To, Subject, Body, CC
export function buildMailtoLink({
  to,
  subject,
  body,
  cc,
  bcc,
}: {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}): string {
  let query = `subject=${encodeURIComponent("Re: " + subject)}`;
  query += `&body=${encodeURIComponent(body)}`;
  if (cc) query += `&cc=${encodeURIComponent(cc)}`;
  if (bcc) query += `&bcc=${encodeURIComponent(bcc)}`;
  return `mailto:${encodeURIComponent(to)}?${query}`;
}

export const EMAIL_CATEGORIES = [
  { id: "admissions", label: "Admissions Inquiry", icon: "GraduationCap", color: "#F5A623" },
  { id: "student_support", label: "Student Support", icon: "Users", color: "#29ABE2" },
  { id: "academic", label: "Academic / Faculty Query", icon: "BookOpen", color: "#27AE60" },
  { id: "administrative", label: "Administrative Request", icon: "FileText", color: "#9B59B6" },
  { id: "medical", label: "Medical / Health Sciences", icon: "Heart", color: "#E74C3C" },
  { id: "engineering", label: "Engineering Programme", icon: "Wrench", color: "#E67E22" },
];

export const SAMPLE_EMAILS = [
  {
    id: "e1",
    from: "jane.nakato@gmail.com",
    subject: "Application for Bachelor of Laws at Nkozi",
    body: "Dear Admissions Office,\n\nI am a student who recently completed my UACE with 2 principal passes and wish to apply for the Bachelor of Laws programme. Could you please provide me with the fees, duration, and application deadline? I am also interested in whether bursaries are available.\n\nKind regards,\nJane Nakato",
    receivedAt: "2025-05-02T08:14:00",
  },
  {
    id: "e2",
    from: "dr.okello@hospital.ug",
    subject: "Masters of Medicine — Internal Medicine programme details",
    body: "Hello,\n\nI am a practicing physician based in Kampala and I would like to pursue the Master of Medicine in Internal Medicine. Please advise on the entry requirements, fees per semester, and whether the programme runs on weekends or full-time only.\n\nThank you,\nDr. Patrick Okello",
    receivedAt: "2025-05-02T09:30:00",
  },
  {
    id: "e3",
    from: "francis.mugerwa@student.umu.ac.ug",
    subject: "Missing mark — Computer Science Year 2 Semester 1",
    body: "Dear Student Affairs,\n\nI am a second-year Computer Science student at Lubaga Campus (Student No: UMU/CS/2023/0142). My results for Semester 1 show a missing mark for CSC2104 — Operating Systems. I sat for the exam on 15th March. Please help me resolve this urgently as registration for Semester 2 is affected.\n\nFrancis Mugerwa",
    receivedAt: "2025-05-02T10:05:00",
  },
  {
    id: "e4",
    from: "headteacher@stjohnss.sc.ug",
    subject: "Request for Certified Copy of Transcript — Staff Member",
    body: "To the Registrar,\n\nWe write on behalf of our staff member Ms. Agnes Birungi who graduated from UMU in 2019 with a Bachelor of Arts with Education. We request a certified copy of her official transcript for employment verification purposes.\n\nPlease advise on the procedure and any associated fees.\n\nPrincipal, St. John's Secondary School",
    receivedAt: "2025-05-02T10:45:00",
  },
  {
    id: "e5",
    from: "m.tukei@ngo.org",
    subject: "Diploma in Counselling Psychology — Fort Portal",
    body: "Good morning,\n\nI work with an NGO in Fort Portal and I am interested in enrolling for the Diploma in Counselling Psychology at your Fort Portal Campus. What are the requirements, fees, and when does the next intake begin?\n\nMany thanks,\nMary Tukei",
    receivedAt: "2025-05-02T11:20:00",
  },
  {
    id: "e6",
    from: "isaac.opio@gmail.com",
    subject: "Bachelor of Science in Civil Engineering — Fort Portal Campus",
    body: "Hello,\n\nI am interested in the Civil Engineering programme. I have seen it is offered at Fort Portal Campus. I would like to know the tuition fees per semester, entry requirements, and the duration. I have 3 principal passes in UACE.\n\nIsaac Opio\nLira",
    receivedAt: "2025-05-02T12:00:00",
  },
];

export type Campus = typeof CAMPUSES[0];
export type EmailCategory = typeof EMAIL_CATEGORIES[0];
export type SampleEmail = typeof SAMPLE_EMAILS[0];
