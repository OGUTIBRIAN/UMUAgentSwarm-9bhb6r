import { CAMPUSES } from "@/constants/umuData";
import type { CategoryId, EmailInput, ProcessingStep, RoutingResult } from "@/types";

// ── Category classification ──────────────────────────────────────────────────

function classifyCategory(subject: string, body: string): { category: CategoryId; confidence: number } {
  const text = `${subject} ${body}`.toLowerCase();

  const scores: Record<CategoryId, number> = {
    medical: 0,
    engineering: 0,
    admissions: 0,
    student_support: 0,
    administrative: 0,
    academic: 0,
  };

  // Medical
  const medTerms = ["medicine", "medical", "nursing", "midwifery", "surgery", "physician",
    "obstetrics", "gynaecology", "paediatrics", "radiology", "orthopedic", "epidemiology",
    "public health", "laboratory sciences", "clinical", "health sciences"];
  medTerms.forEach((t) => { if (text.includes(t)) scores.medical += 2; });

  // Engineering
  const engTerms = ["engineering", "civil", "electrical", "mechanical", "manufacturing",
    "water engineering", "diploma in engineering"];
  engTerms.forEach((t) => { if (text.includes(t)) scores.engineering += 2; });

  // Admissions
  const admTerms = ["apply", "application", "admission", "enroll", "enrol", "programme",
    "fees", "tuition", "entry requirement", "uace", "intake", "bursary",
    "scholarship", "principal pass", "how to join", "requirements", "apply for"];
  admTerms.forEach((t) => { if (text.includes(t)) scores.admissions += 1.5; });

  // Student support
  const stuTerms = ["student", "mark", "result", "exam", "registration", "semester",
    "timetable", "missing mark", "retake", "transcript request", "student number",
    "course unit", "supplementary", "academic record", "grade", "gpa"];
  stuTerms.forEach((t) => { if (text.includes(t)) scores.student_support += 1.5; });

  // Administrative
  const adminTerms = ["transcript", "certified", "certification", "verification",
    "document", "records", "official letter", "clearance", "staff", "certificate of completion",
    "employment", "reference", "copy of", "confirm"];
  adminTerms.forEach((t) => { if (text.includes(t)) scores.administrative += 1.5; });

  // Academic/faculty
  const acTerms = ["faculty", "course", "research", "lecture", "study", "curriculum",
    "module", "distance learning", "blended", "online", "counselling", "psychology",
    "agriculture", "law", "social sciences", "education", "science", "information technology",
    "computer science", "business", "journalism", "architecture"];
  acTerms.forEach((t) => { if (text.includes(t)) scores.academic += 1; });

  // Pick highest
  const sorted = (Object.entries(scores) as [CategoryId, number][]).sort((a, b) => b[1] - a[1]);
  const winner = sorted[0];
  const total = sorted.reduce((s, [, v]) => s + v, 0) || 1;
  const confidence = Math.min(98, Math.round((winner[1] / total) * 100 + 30));

  return { category: winner[0], confidence };
}

// ── Campus routing ────────────────────────────────────────────────────────────

function routeToCampus(subject: string, body: string, category: CategoryId): string {
  const text = `${subject} ${body}`.toLowerCase();

  // Explicit campus mentions
  if (text.includes("nsambya") || text.includes("mother kevin") || text.includes("postgraduate medical"))
    return "nsambya";
  if (text.includes("fort portal") || text.includes("virika") || text.includes("western uganda"))
    return "fortportal";
  if (text.includes("lubaga") || text.includes("kampala city") || text.includes("centenary bank"))
    return "lubaga";
  if (text.includes("masaka") || text.includes("bwala"))
    return "masaka";
  if (text.includes("ngetta") || text.includes("lira") || text.includes("northern uganda"))
    return "ngetta";
  if (text.includes("mbale") || text.includes("eastern uganda") || text.includes("st. austin"))
    return "mbale";
  if (text.includes("nkozi") || text.includes("main campus") || text.includes("kampala-masaka"))
    return "nkozi";

  // Category-based routing
  if (category === "medical") return "nsambya";
  if (category === "engineering") return "fortportal";

  // Keyword-based routing for programmes
  if (text.includes("computer forensics") || text.includes("ict architectural") || text.includes("real estate"))
    return "lubaga";
  if (text.includes("counselling psychology") && (text.includes("diploma") || text.includes("certificate")))
    return "fortportal";
  if (text.includes("journalism") || text.includes("built environment") || text.includes("architecture"))
    return "nkozi";
  if (text.includes("agro-ecology") || text.includes("ecological organic") || text.includes("agribusiness innovation"))
    return "lubaga";

  // Default: Main campus handles general admissions and law
  if (category === "admissions" || category === "administrative") return "nkozi";
  return "nkozi";
}

// ── Faculty assignment ────────────────────────────────────────────────────────

function assignFaculty(campusId: string, category: CategoryId, text: string): string {
  const t = text.toLowerCase();

  if (category === "medical") return "Mother Kevin Postgraduate Medical School";
  if (category === "engineering") return "Faculty of Engineering and Applied Sciences";

  if (t.includes("law") || t.includes("llb") || t.includes("legal") || t.includes("administrative law"))
    return "Faculty of Law";
  if (t.includes("agriculture") || t.includes("agro") || t.includes("crop") || t.includes("animal production"))
    return "Faculty of Agriculture";
  if (t.includes("education") || t.includes("teaching") || t.includes("primary") || t.includes("early childhood"))
    return "Faculty of Education";
  if (t.includes("computer") || t.includes("it ") || t.includes("information technology") || t.includes("ict") || t.includes("software") || t.includes("forensics"))
    return "Faculty of Science";
  if (t.includes("nursing") || t.includes("health") || t.includes("public health") || t.includes("laboratory"))
    return "Faculty of Health Sciences";
  if (t.includes("counselling") || t.includes("social work") || t.includes("journalism") || t.includes("diplomacy") || t.includes("development studies"))
    return "School of Arts and Social Sciences";
  if (t.includes("mba") || t.includes("business") || t.includes("accounting") || t.includes("finance") || t.includes("microfinance") || t.includes("procurement"))
    return "Faculty of Business Administration and Management";
  if (t.includes("architecture") || t.includes("urban planning") || t.includes("environmental design"))
    return "Faculty of the Built Environment";
  if (category === "administrative") return "Office of the Registrar";
  if (category === "student_support") return "Student Affairs Directorate";
  return "Office of the Registrar";
}

// ── Draft reply generation ────────────────────────────────────────────────────

function generateDraftReply(email: EmailInput, campusId: string, category: CategoryId, faculty: string): string {
  const campus = CAMPUSES.find((c) => c.id === campusId)!;
  const senderName = email.from.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const t = `${email.subject} ${email.body}`.toLowerCase();

  const greeting = `Dear ${senderName},\n\nThank you for contacting Uganda Martyrs University (UMU). My name is ${campus.agentName}, the AI assistant for ${campus.name}. I have received your email and I am happy to assist you.\n\n`;
  const sign = `\nShould you require further assistance or wish to speak with a human staff member, please reply to this email or contact ${campus.email} directly.\n\nWarm regards,\n${campus.agentName} — AI Assistant\n${campus.name}, Uganda Martyrs University\n${campus.email}`;

  if (category === "admissions") {
    if (t.includes("law") || t.includes("llb")) {
      return `${greeting}Regarding the Bachelor of Laws (LLB) programme at our ${campus.name}:\n\n• Duration: 4 years (Full-Time/Blended)\n• Annual Tuition: UGX 2,320,000 (Local) | USD 1,333 (International)\n• Entry Requirements: Minimum of two (2) Principal Passes at UACE in any subjects at the same sitting, or an equivalent qualification.\n• Application Fee: UGX 30,000 (non-refundable)\n\nRegarding bursaries, Half-Tuition Bursaries are available for some Full-Time programmes. You will need a recommendation letter from a Bishop, Superior General, Head Teacher, or LC5 Chairperson. You can download the bursary form at https://umu.ac.ug.\n\nTo apply, please visit https://admissions.umu.ac.ug or download a paper application form at https://umu.ac.ug. For specific intake dates, please contact our Registrar at registrar@umu.ac.ug.${sign}`;
    }
    if (t.includes("engineering") || t.includes("civil") || t.includes("electrical") || t.includes("mechanical")) {
      return `${greeting}Regarding the Engineering programmes at our Fort Portal Campus:\n\n• Bachelor of Science in Civil Engineering — UGX 1,489,000/year\n• Bachelor of Science in Electrical Engineering — UGX 1,489,000/year\n• Bachelor of Science in Mechanical and Manufacturing Engineering — UGX 1,489,000/year\n• Duration: 3–4 years (Full-Time/Blended)\n• Entry Requirements: Minimum of two (2) Principal Passes at UACE (preferably in Mathematics and Sciences), or equivalent.\n\nDiploma options (2 years) are also available at UGX 580,000/year for Civil, Electrical, Mechanical, and Water Engineering.\n\nTo apply, visit https://admissions.umu.ac.ug or email directorfp@umu.ac.ug.${sign}`;
    }
    if (t.includes("counsel") || t.includes("psychology")) {
      return `${greeting}Thank you for your interest in our Counselling Psychology programmes at Fort Portal Campus:\n\n• Bachelor of Arts in Counselling Psychology (PT/Blended, 3 years) — UGX 893,000/year\n• Diploma in Counselling Psychology (PT/Blended, 2 years) — UGX 550,000/year\n• Certificate in Child and Adolescent Counselling (2 years) — UGX 350,000/year\n• Certificate in HIV/AIDS Counselling (2 years) — UGX 350,000/year\n\nEntry Requirements for Bachelor's: Two (2) Principal Passes at UACE or relevant diploma with at least a Credit.\n\nThe next intake details will be confirmed by the Fort Portal Campus Director. Please contact directorfp@umu.ac.ug or call +256 743 909229 for exact dates.${sign}`;
    }
    if (t.includes("computer science") || t.includes("information technology") || t.includes("ict")) {
      return `${greeting}Regarding the ICT/Computer Science programmes available at ${campus.name}:\n\n• Bachelor of Science in Computer Science (3 years, FT/Blended) — UGX 1,100,000/year\n• Bachelor of Science in Information Technology (3 years, FT/Blended) — UGX 1,100,000/year\n• Master of Science in Information Systems (2 years, PT) — UGX 1,580,500/year\n• Master of Science in Computer Forensics (2 years, PT) — UGX 1,580,500/year\n• Short Courses: Certificate in Data Analytics (5 weeks) — UGX 350,000\n\nEntry Requirements: Minimum of two (2) Principal Passes at UACE, preferably in Mathematics/Sciences. Diploma holders with at least a Credit are also eligible.\n\nApply online at https://admissions.umu.ac.ug.${sign}`;
    }
    return `${greeting}Thank you for your interest in studying at Uganda Martyrs University. We are delighted to receive your enquiry.\n\nUMU offers a wide range of programmes across 7 campuses in Uganda. Based on your enquiry, your query has been routed to ${campus.name} (${faculty}).\n\nTo explore all available programmes and fees, please visit: https://umu.ac.ug\nTo apply online: https://admissions.umu.ac.ug\n\nApplication fees:\n• Undergraduate: UGX 30,000 | USD 30\n• Masters / PG Diplomas: UGX 50,000 | USD 50\n• PhD / Medical School: UGX 100,000 | USD 50\n\nFor specific programme details, please contact ${campus.email} or call our admissions line: +256 743 897221.${sign}`;
  }

  if (category === "medical") {
    return `${greeting}Thank you for your interest in postgraduate medical training at Uganda Martyrs University.\n\nThe Mother Kevin Postgraduate Medical School is located at our Nsambya Campus in Kampala.\n\nProgrammes available (3 years, Full-Time):\n• Master of Medicine in Internal Medicine\n• Master of Medicine in Obstetrics and Gynaecology\n• Master of Medicine in Paediatrics and Child Health\n• Master of Medicine in General Surgery\n• Master of Medicine in Emergency Medicine\n• Master of Medicine in Radiology & Imaging\n• Master of Medicine in Orthopedic Surgery\n\nAll MMed programmes: UGX 3,300,000/year | USD 3,370/year\n\nEntry Requirements: A recognized MBChB degree (or equivalent) from a chartered university, plus at least 2 years post-internship clinical experience. A Graduate Admission Test (GAT) is required.\n\nApplication Fee: UGX 100,000 | USD 50\n\nContact: pgmnsambya@umu.ac.ug | +256 393 215786${sign}`;
  }

  if (category === "student_support") {
    return `${greeting}I have received your concern regarding your academic record.\n\nFor missing marks, the standard procedure at UMU is:\n1. Submit a Missing Mark Form to your Faculty Office — obtainable from the Academic Registrar's desk.\n2. Attach your examination permit and any supporting evidence (e.g., signed exam attendance list).\n3. The form is reviewed by the Course Lecturer, then forwarded to the Faculty Board.\n4. Corrections are typically processed within 10–14 working days.\n\nFor urgent cases affecting registration, please visit the Student Affairs Office at ${campus.name} in person, or email ${campus.email} with your student number, programme, course unit, and examination date.\n\nYou can also reach the Academic Registrar at registrar@umu.ac.ug for escalation.${sign}`;
  }

  if (category === "administrative") {
    return `${greeting}Thank you for your administrative request.\n\nFor official transcript and document requests, the standard procedure is:\n\n1. Submit a written request (or email) to the Registrar's Office\n2. Attach a copy of your National ID and proof of graduation/enrollment\n3. Pay the transcript fee (confirm current amount with the Registrar)\n4. Processing time: 5–10 working days for standard requests; 2–3 working days for urgent requests (additional fee may apply)\n\nFor certified copies of transcripts or degrees for employment/verification purposes, please contact:\n• Email: registrar@umu.ac.ug\n• Tel: +256 743 897219\n• Address: Registrar's Office, UMU Main Campus, P.O. Box 5498, Kampala\n\nPlease note that all official documents bear the university seal and the Registrar's signature.${sign}`;
  }

  return `${greeting}I have received your enquiry and have routed it to the ${faculty} at ${campus.name} for appropriate handling.\n\nA specialist from our team will review your message and respond within 1–2 working days. In the meantime, for general information about Uganda Martyrs University, please visit https://www.umu.ac.ug.\n\nFor urgent matters, please contact:\n• ${campus.name}: ${campus.email}\n• Main Registrar: registrar@umu.ac.ug\n• Tel: +256 743 897219${sign}`;
}

// ── Routing reasoning ─────────────────────────────────────────────────────────

function buildReasoning(
  campusId: string,
  category: CategoryId,
  faculty: string,
  subject: string,
  body: string
): string {
  const campus = CAMPUSES.find((c) => c.id === campusId)!;
  const text = `${subject} ${body}`.toLowerCase();

  const signals: string[] = [];
  if (text.includes(campus.name.toLowerCase().split(" ")[0].toLowerCase())) signals.push(`explicit mention of "${campus.name}"`);
  if (category === "medical") signals.push("medical/health-related keywords detected");
  if (category === "engineering") signals.push("engineering programme keywords detected");
  if (text.includes("diploma") || text.includes("bachelor") || text.includes("master") || text.includes("phd")) signals.push("academic level indicator found");

  const signalStr = signals.length > 0 ? signals.join("; ") : "programme keyword pattern match";
  return `Intake Agent classified email as "${category.replace("_", " ")}" based on subject/body analysis. Routing to ${campus.agentName} at ${campus.name} (${faculty}) because: ${signalStr}. Agent will respond using UMU knowledge base.`;
}

// ── Main engine function ──────────────────────────────────────────────────────

export function processEmail(email: EmailInput): Omit<RoutingResult, "processingSteps"> {
  const { category, confidence } = classifyCategory(email.subject, email.body);
  const campusId = routeToCampus(email.subject, email.body, category);
  const campus = CAMPUSES.find((c) => c.id === campusId)!;
  const faculty = assignFaculty(campusId, category, `${email.subject} ${email.body}`);
  const categoryLabels: Record<CategoryId, string> = {
    admissions: "Admissions Inquiry",
    student_support: "Student Support",
    academic: "Academic / Faculty Query",
    administrative: "Administrative Request",
    medical: "Medical / Health Sciences",
    engineering: "Engineering Programme",
  };

  return {
    emailId: `EMX-${Date.now()}`,
    from: email.from,
    subject: email.subject,
    body: email.body,
    receivedAt: email.receivedAt,
    category,
    categoryLabel: categoryLabels[category],
    confidence,
    campusId,
    campusName: campus.name,
    agentName: campus.agentName,
    faculty,
    reasoning: buildReasoning(campusId, category, faculty, email.subject, email.body),
    draftReply: generateDraftReply(email, campusId, category, faculty),
    processedAt: new Date().toISOString(),
  };
}

export function buildProcessingSteps(campusName: string, agentName: string, category: string): ProcessingStep[] {
  return [
    { label: "Email received", detail: "Intake Agent captured incoming message", doneAt: 400 },
    { label: "Content parsing", detail: "Extracting subject, body, sender metadata", doneAt: 900 },
    { label: "Intent classification", detail: `Category identified: ${category}`, doneAt: 1600 },
    { label: "Campus routing", detail: `Matched to ${campusName}`, doneAt: 2200 },
    { label: "Agent assignment", detail: `Handing off to ${agentName}`, doneAt: 2800 },
    { label: "Knowledge base query", detail: "Retrieving UMU programme & contact data", doneAt: 3600 },
    { label: "Draft reply generated", detail: `${agentName} has composed a response`, doneAt: 4400 },
  ];
}
