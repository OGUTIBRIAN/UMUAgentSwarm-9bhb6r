import { CAMPUSES } from "@/constants/umuData";
import { supabase } from "@/lib/supabase";
import type { CategoryId, EmailInput, ProcessingStep, RoutingResult } from "@/types";

// ── Fallback: rule-based classification ──────────────────────────────────────

function classifyCategory(subject: string, body: string): { category: CategoryId; confidence: number } {
  const text = `${subject} ${body}`.toLowerCase();
  const scores: Record<CategoryId, number> = {
    medical: 0, engineering: 0, admissions: 0,
    student_support: 0, administrative: 0, academic: 0,
  };

  const medTerms = ["medicine", "medical", "nursing", "midwifery", "surgery", "physician",
    "obstetrics", "gynaecology", "paediatrics", "radiology", "orthopedic", "epidemiology",
    "public health", "laboratory sciences", "clinical", "health sciences"];
  medTerms.forEach((t) => { if (text.includes(t)) scores.medical += 2; });

  const engTerms = ["engineering", "civil", "electrical", "mechanical", "manufacturing", "water engineering"];
  engTerms.forEach((t) => { if (text.includes(t)) scores.engineering += 2; });

  const admTerms = ["apply", "application", "admission", "enroll", "programme", "fees", "tuition",
    "entry requirement", "uace", "intake", "bursary", "scholarship", "principal pass", "requirements"];
  admTerms.forEach((t) => { if (text.includes(t)) scores.admissions += 1.5; });

  const stuTerms = ["student", "mark", "result", "exam", "registration", "semester",
    "timetable", "missing mark", "retake", "transcript request", "student number", "grade", "gpa"];
  stuTerms.forEach((t) => { if (text.includes(t)) scores.student_support += 1.5; });

  const adminTerms = ["transcript", "certified", "verification", "document", "records",
    "official letter", "clearance", "certificate of completion", "employment", "reference", "confirm"];
  adminTerms.forEach((t) => { if (text.includes(t)) scores.administrative += 1.5; });

  const acTerms = ["faculty", "course", "research", "lecture", "study", "curriculum",
    "module", "distance learning", "blended", "online", "counselling", "psychology",
    "agriculture", "law", "social sciences", "education", "science", "information technology",
    "computer science", "business", "journalism", "architecture"];
  acTerms.forEach((t) => { if (text.includes(t)) scores.academic += 1; });

  const sorted = (Object.entries(scores) as [CategoryId, number][]).sort((a, b) => b[1] - a[1]);
  const winner = sorted[0];
  const total = sorted.reduce((s, [, v]) => s + v, 0) || 1;
  const confidence = Math.min(85, Math.round((winner[1] / total) * 100 + 25));
  return { category: winner[0], confidence };
}

function routeToCampus(subject: string, body: string, category: CategoryId): string {
  const text = `${subject} ${body}`.toLowerCase();
  if (text.includes("nsambya") || text.includes("mother kevin")) return "nsambya";
  if (text.includes("fort portal") || text.includes("virika")) return "fortportal";
  if (text.includes("lubaga") || text.includes("centenary bank")) return "lubaga";
  if (text.includes("masaka") || text.includes("bwala")) return "masaka";
  if (text.includes("ngetta") || text.includes("lira")) return "ngetta";
  if (text.includes("mbale") || text.includes("st. austin")) return "mbale";
  if (category === "medical") return "nsambya";
  if (category === "engineering") return "fortportal";
  if (text.includes("computer forensics") || text.includes("ict architectural") || text.includes("real estate")) return "lubaga";
  return "nkozi";
}

function assignFaculty(campusId: string, category: CategoryId, text: string): string {
  const t = text.toLowerCase();
  if (category === "medical") return "Mother Kevin Postgraduate Medical School";
  if (category === "engineering") return "Faculty of Engineering and Applied Sciences";
  if (t.includes("law") || t.includes("llb")) return "Faculty of Law";
  if (t.includes("agriculture") || t.includes("agro") || t.includes("crop")) return "Faculty of Agriculture";
  if (t.includes("education") || t.includes("teaching") || t.includes("primary")) return "Faculty of Education";
  if (t.includes("computer") || t.includes("information technology") || t.includes("ict")) return "Faculty of Science";
  if (t.includes("nursing") || t.includes("health") || t.includes("public health")) return "Faculty of Health Sciences";
  if (t.includes("counselling") || t.includes("social work") || t.includes("journalism") || t.includes("diplomacy")) return "School of Arts and Social Sciences";
  if (t.includes("mba") || t.includes("business") || t.includes("accounting") || t.includes("finance")) return "Faculty of Business Administration and Management";
  if (t.includes("architecture") || t.includes("urban planning")) return "Faculty of the Built Environment";
  if (category === "administrative") return "Office of the Registrar";
  if (category === "student_support") return "Student Affairs Directorate";
  return "Office of the Registrar";
}

function generateFallbackReply(email: EmailInput, campusId: string, category: CategoryId, faculty: string): string {
  const campus = CAMPUSES.find((c) => c.id === campusId)!;
  const senderName = email.from.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  return `Dear ${senderName},\n\nThank you for contacting Uganda Martyrs University (UMU). I am ${campus.agentName}, the AI assistant for ${campus.name}.\n\nYour email has been received and routed to the ${faculty}. A staff member will follow up within 1–2 working days.\n\nFor immediate assistance:\n• Email: ${campus.email}\n• Admissions: admissions@umu.ac.ug | +256 743 897221\n• Website: https://www.umu.ac.ug\n\nWarm regards,\n${campus.agentName} — AI Assistant\n${campus.name}, Uganda Martyrs University\n${campus.email}`;
}

function buildFallbackResult(email: EmailInput): Omit<RoutingResult, "processingSteps"> {
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
    reasoning: `Fallback routing: classified as "${category}" and routed to ${campus.agentName} at ${campus.name}.`,
    draftReply: generateFallbackReply(email, campusId, category, faculty),
    processedAt: new Date().toISOString(),
    status: "draft",
  };
}

// ── Main AI-powered engine function ──────────────────────────────────────────

export async function processEmail(email: EmailInput): Promise<Omit<RoutingResult, "processingSteps">> {
  const categoryLabels: Record<string, string> = {
    admissions: "Admissions Inquiry",
    student_support: "Student Support",
    academic: "Academic / Faculty Query",
    administrative: "Administrative Request",
    medical: "Medical / Health Sciences",
    engineering: "Engineering Programme",
  };

  try {
    console.log(`[AgentEngine] Sending to AI: "${email.subject}"`);

    const { data, error } = await supabase.functions.invoke('process-email', {
      body: {
        emailFrom: email.from,
        emailSubject: email.subject,
        emailBody: email.body,
      },
    });

    if (error) {
      let errorMessage = error.message;
      try {
        // @ts-ignore
        if (error.context) {
          // @ts-ignore
          const textContent = await error.context.text?.();
          if (textContent) errorMessage = textContent;
        }
      } catch (_) { /* ignore */ }
      console.error('[AgentEngine] Edge function error:', errorMessage);
      console.warn('[AgentEngine] Falling back to rule-based engine');
      return buildFallbackResult(email);
    }

    if (!data?.success || !data?.result) {
      console.error('[AgentEngine] Unexpected response shape:', data);
      return buildFallbackResult(email);
    }

    const ai = data.result;
    const campusId: string = ai.campusId || 'nkozi';
    const campus = CAMPUSES.find((c) => c.id === campusId) ?? CAMPUSES[0];
    const category = (ai.category as CategoryId) || 'academic';

    console.log(`[AgentEngine] AI routed to: ${campus.agentName} | category: ${category} | confidence: ${ai.confidence}`);

    return {
      emailId: `EMX-${Date.now()}`,
      from: email.from,
      subject: email.subject,
      body: email.body,
      receivedAt: email.receivedAt,
      category,
      categoryLabel: ai.categoryLabel || categoryLabels[category] || category,
      confidence: typeof ai.confidence === 'number' ? Math.min(98, Math.max(40, ai.confidence)) : 75,
      campusId,
      campusName: ai.campusName || campus.name,
      agentName: ai.agentName || campus.agentName,
      faculty: ai.faculty || 'Office of the Registrar',
      reasoning: ai.reasoning || 'Classified by AI intake agent.',
      draftReply: ai.draftReply || generateFallbackReply(email, campusId, category, ai.faculty || 'Office of the Registrar'),
      processedAt: new Date().toISOString(),
      status: 'draft',
    };

  } catch (err) {
    console.error('[AgentEngine] Unexpected error, using fallback:', err);
    return buildFallbackResult(email);
  }
}

// ── Processing steps (unchanged) ─────────────────────────────────────────────

export function buildProcessingSteps(campusName: string, agentName: string, category: string): ProcessingStep[] {
  return [
    { label: "Email received", detail: "Intake Agent captured incoming message", doneAt: 400 },
    { label: "Content parsing", detail: "Extracting subject, body, sender metadata", doneAt: 900 },
    { label: "AI classification", detail: `Gemini 3 Flash analysing intent & context`, doneAt: 1800 },
    { label: "Campus routing", detail: `Matched to ${campusName}`, doneAt: 2600 },
    { label: "Agent assignment", detail: `Handing off to ${agentName}`, doneAt: 3200 },
    { label: "Knowledge base query", detail: "AI querying UMU programme & contact data", doneAt: 4200 },
    { label: "Draft reply generated", detail: `${agentName} has composed a personalised response`, doneAt: 5200 },
  ];
}
