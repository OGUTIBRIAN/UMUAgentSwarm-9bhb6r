import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const UMU_KNOWLEDGE_BASE = `
UGANDA MARTYRS UNIVERSITY (UMU) — OFFICIAL KNOWLEDGE BASE 2025/2026

ABOUT UMU:
Full Name: Uganda Martyrs University (UMU)
Tagline: Making a Difference — The Premier Catholic Founded University in Uganda
Type: Faith-based, private, not-for-profit university
Founded: 18th October 1993 | Charter: 2nd April 2005
Student Population: Over 6,000 students
Website: https://www.umu.ac.ug | Admissions: https://admissions.umu.ac.ug

CAMPUSES AND AGENTS:
1. NKOZI CAMPUS (Agent: NkoziBot) — Main Campus, 83km Kampala-Masaka Hwy | registrar@umu.ac.ug
   Faculties: Agriculture, Business Administration, Built Environment, Education, Science, Arts & Social Sciences, Law, Graduate Studies
2. LUBAGA CAMPUS (Agent: LubagaBot) — Near Lubaga Cathedral, Kampala | coordinatorlubaga@umu.ac.ug
   Faculties: Agriculture (Masters), Business Administration, Education, Health Sciences, Science (ICT/CS), Arts & Social Sciences, Law
3. NSAMBYA CAMPUS (Agent: NsambyaBot) — Opposite Nsambya Parish, Kampala | pgmnsambya@umu.ac.ug
   Faculties: Mother Kevin Postgraduate Medical School, Health Sciences
4. FORT PORTAL CAMPUS (Agent: FortPortalBot) — Virika, Fort Portal, Western Uganda | directorfp@umu.ac.ug
   Faculties: Agriculture, Business Administration, Education, Health Sciences, Engineering and Applied Sciences
5. MASAKA CAMPUS (Agent: MasakaBot) — Bwala Social Centre, Masaka | umumasaka@umu.ac.ug
   Faculties: Business Administration, Education, Science, Arts & Social Sciences, Law
6. NGETTA CAMPUS (Agent: NgettaBot) — Former Ngetta TTC, Lira, Northern Uganda | directorngetta@umu.ac.ug
   Faculties: Agriculture, Business Administration, Education, Arts & Social Sciences
7. MBALE CAMPUS (Agent: MbaleBot) — St. Austin Mbale, Eastern Uganda | jkmusisi@umu.ac.ug
   Faculties: Business Administration, Education, Arts & Social Sciences

CAMPUS ID CODES: nkozi, lubaga, nsambya, fortportal, masaka, ngetta, mbale

CATEGORY CODES: admissions, student_support, academic, administrative, medical, engineering

APPLICATION FEES (Non-refundable):
- Undergraduate: UGX 30,000 (USD 30)
- Masters/Postgraduate Diplomas: UGX 50,000 (USD 50)
- PhD/Medical School: UGX 100,000 (USD 50)

ENTRY REQUIREMENTS:
- Bachelor's: Minimum 2 Principal Passes at UACE
- Masters: Second Class Honours degree + GAT test + 2 years work experience
- PhD: Master's degree + 8-page research concept note
- Diploma: 1 Principal Pass + 2 Subsidiary Passes at UACE
- Certificate: 5 Passes at UCE

PROGRAMMES AT NKOZI (Main Campus):
Faculty of Agriculture: Bachelor of Agriculture (FT, 3yr, UGX 1,522,500), BSc Agriculture (DL, 4yr, UGX 468,000), BSc Ecological Organic Agriculture (DL, 4yr, UGX 468,000), BSc Agricultural Economics & Agribusiness (FT, 3yr, UGX 1,522,500), BSc Agricultural Technology (FT, 4yr, UGX 1,522,500), Diploma Animal Production (FT, 2yr, UGX 429,000)
Faculty of Business: BBA (FT, 3yr, UGX 1,525,000), BSc Accounting & Finance (FT, 3yr, UGX 1,525,000), Bachelor Procurement & Supply Chain (FT, 3yr, UGX 1,525,000), Bachelor International Business (FT, 3yr, UGX 1,525,000)
Faculty of the Built Environment: Master of Architecture (FT, 2yr, UGX 3,450,000), Bachelor of Environmental Design (FT, 3yr, UGX 2,457,900)
Faculty of Science: BSc Computer Science (FT, 3yr, UGX 1,507,500), BSc IT (FT, 3yr, UGX 1,507,500), BSc Mathematics (FT, 3yr, UGX 1,507,500), Diploma IT (FT, 2yr, UGX 785,000)
Faculty of Law: Bachelor of Laws LLB (FT, 4yr, UGX 2,320,000 / USD 1,333)
Faculty of Education: BA with Education (FT, 3yr, UGX 1,046,300), BSc with Education (FT, 3yr, UGX 1,046,300), BEd Primary (DL, 3yr), BEd Early Childhood (Blended, 3yr, UGX 327,500)
School of Arts & Social Sciences: BA Journalism & Mass Communication (FT, 3yr, UGX 1,525,000), BA Social Work (FT, 3yr, UGX 1,020,000), BA International Relations & Diplomacy (FT, 3yr, UGX 1,507,500)
Graduate Studies: PhD Agro-ecology (FT, 3yr, UGX 3,737,500), PhD Business Administration (FT, 4yr, UGX 4,501,900), PhD Information Systems (PT, 3yr, UGX 4,501,900)

PROGRAMMES AT LUBAGA CAMPUS:
Faculty of Business: MBA (PT, 2yr, UGX 1,580,500), MSc Development Economics (2yr, UGX 1,580,500), BBA Evening (3yr, UGX 1,100,100), BSc Accounting & Finance PT (3yr, UGX 1,100,100)
Faculty of Science (ICT): MSc ICT Architectural Design (PT, 2yr, UGX 1,580,500), MSc Information Systems (PT, 2yr, UGX 1,580,500), MSc Computer Forensics (PT, 2yr, UGX 1,580,500), BSc Computer Science (FT, 3yr, UGX 1,100,000), BSc IT (FT, 3yr, UGX 1,100,000)
Faculty of Health Sciences: MPH (PT, 2yr, UGX 1,730,500), BSc Nursing PT (3yr, UGX 1,085,000), BSc Laboratory Sciences PT (3yr, UGX 1,085,000)
Faculty of Agriculture (Masters): MSc Agro-Ecology (PT, 2yr, UGX 1,820,000), MSc Monitoring & Evaluation (PT, 2yr, UGX 1,557,500)
Faculty of Education: PhD Education (FT, 4yr, UGX 1,230,000), MEd Holiday (2yr, UGX 832,500), Masters Higher Education Online (2yr, UGX 1,440,000)

PROGRAMMES AT NSAMBYA CAMPUS (Mother Kevin Postgraduate Medical School):
MMed Internal Medicine (FT, 3yr, UGX 3,300,000/USD 3,370), MMed Obstetrics & Gynaecology (FT, 3yr, UGX 3,300,000), MMed Paediatrics & Child Health (FT, 3yr, UGX 3,300,000), MMed General Surgery (FT, 3yr, UGX 3,300,000), MMed Emergency Medicine (FT, 3yr, UGX 3,300,000), MMed Radiology & Imaging (FT, 3yr, UGX 3,300,000), MMed Orthopedic Surgery (FT, 3yr, UGX 3,300,000)
BSc Nursing Sciences (FT, 3yr, UGX 2,500,000), BSc Midwifery Sciences (FT, 3yr, UGX 2,500,000), BSc Medical Laboratory Sciences (FT, 2yr, UGX 2,500,000)
Contact: pgmnsambya@umu.ac.ug | +256 393 215786

PROGRAMMES AT FORT PORTAL CAMPUS:
Faculty of Engineering: BSc Civil Engineering (FT, 3-4yr, UGX 1,489,000), BSc Electrical Engineering (FT, 3-4yr, UGX 1,489,000), BSc Mechanical & Manufacturing Engineering (FT, 3-4yr, UGX 1,489,000), Diploma Civil Eng (2yr, UGX 580,000), Diploma Electrical Eng (2yr, UGX 580,000), Diploma Mechanical Eng (2yr, UGX 580,000), Diploma Water Engineering (2yr, UGX 580,000)
Faculty of Health Sciences: MSc Counselling Psychology (PT, 2yr, UGX 1,318,000), BA Counselling Psychology PT (3yr, UGX 893,000), Diploma Counselling Psychology (2yr, UGX 550,000), Certificate in HIV/AIDS Counselling (2yr, UGX 350,000)
Faculty of Business: MBA PT (2yr, UGX 1,580,500), BBA Evening/DL (3-4yr, UGX 893,000)
Tel: +256 743 909229 / +256 782 308334

PROGRAMMES AT MASAKA CAMPUS:
Faculty of Education: MEd Holiday (2yr, UGX 1,292,500), BA with Education (3yr, UGX 893,000), BSc with Education (3yr, UGX 893,000)
Faculty of Science: BSc IT Evening (3yr, UGX 888,000), Diploma IT Weekend (2yr, UGX 495,500)
Faculty of Law: Certificate in Administrative Law (8 months, UGX 800,000)

PROGRAMMES AT NGETTA CAMPUS (Lira):
Faculty of Agriculture: BSc Agricultural Economics (FT, 3yr, UGX 680,000), BSc Agriculture DL (4yr, UGX 468,000), Diploma Agricultural Economics (2yr, UGX 429,000), Diploma Crop Production (2yr, UGX 429,000), Certificate in Agriculture (1yr, UGX 275,000)
Faculty of Business: MBA PT (3yr, UGX 1,580,500), BBA FT (3yr, UGX 680,000)
Faculty of Education: BSc with Education (3yr, UGX 893,000), BEd Primary DL (4yr, UGX 327,500)

PROGRAMMES AT MBALE CAMPUS:
Faculty of Business: MBA PT (2yr, UGX 1,580,500)
Faculty of Education: BEd Primary DL (4yr, UGX 327,500), BEd Early Childhood DL (2yr, UGX 212,500)

FREQUENTLY ASKED QUESTIONS:
Q: How do I apply? A: Visit https://admissions.umu.ac.ug or email admissions@umu.ac.ug
Q: Are there bursaries? A: Yes, half-tuition bursaries for some FT programmes. Recommendation from Bishop/Head Teacher/LC5 Chairperson needed. Download form at umu.ac.ug
Q: What is GAT? A: Graduate Admission Test required for Masters applicants
Q: Contact for admissions? A: registrar@umu.ac.ug | +256 743 897221
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('ONSPACE_AI_API_KEY');
    const baseUrl = Deno.env.get('ONSPACE_AI_BASE_URL');

    if (!apiKey || !baseUrl) {
      throw new Error('OnSpace AI environment variables not configured');
    }

    const { emailFrom, emailSubject, emailBody } = await req.json();

    if (!emailSubject || !emailBody) {
      return new Response(
        JSON.stringify({ error: 'emailSubject and emailBody are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are the UMU Central AI Intake Agent for Uganda Martyrs University. Your job is to analyse incoming emails, classify them, route them to the correct campus agent, and draft a professional, personalised reply on behalf of that campus agent.

You have access to the complete UMU knowledge base below. Use it to write accurate, specific replies with correct fees, programmes, entry requirements, and contact details.

${UMU_KNOWLEDGE_BASE}

RESPONSE FORMAT:
You MUST respond with ONLY a valid JSON object in this exact structure (no markdown, no explanation outside the JSON):
{
  "category": "<one of: admissions | student_support | academic | administrative | medical | engineering>",
  "categoryLabel": "<human-readable label>",
  "campusId": "<one of: nkozi | lubaga | nsambya | fortportal | masaka | ngetta | mbale>",
  "campusName": "<full campus name>",
  "agentName": "<agent name e.g. NkoziBot>",
  "faculty": "<specific faculty or office handling this>",
  "confidence": <integer 60-98>,
  "reasoning": "<1-2 sentences explaining why this campus/category was chosen>",
  "draftReply": "<full professional email reply from the campus agent, using real UMU data, fees, contacts>"
}

ROUTING RULES:
- Medical/health postgraduate → nsambya (NsambyaBot)
- Engineering programmes → fortportal (FortPortalBot)
- Mentions Fort Portal / Virika / Western Uganda → fortportal
- Mentions Lubaga / Kampala city → lubaga
- Mentions Masaka / Bwala → masaka
- Mentions Lira / Ngetta / Northern Uganda → ngetta
- Mentions Mbale / Eastern Uganda → mbale
- Mentions Nsambya / Mother Kevin → nsambya
- General admissions, law, main campus queries → nkozi
- ICT Masters / Computer Forensics / Real Estate → lubaga

REPLY GUIDELINES:
- Address the sender by first name (extract from email address if not in body)
- Sign as the campus agent (e.g. NkoziBot — AI Assistant, Nkozi Campus, Uganda Martyrs University)
- Include specific fees in UGX and USD where applicable
- Include relevant contact email and phone number
- Be warm, professional, and concise
- For admissions queries: include programme details, fees, entry requirements, application link
- For student support: outline the formal procedure step by step
- For administrative requests: provide clear next steps and contact details`;

    const userMessage = `Incoming email to process:

FROM: ${emailFrom || 'unknown@example.com'}
SUBJECT: ${emailSubject}
BODY:
${emailBody}

Classify this email, route it to the correct campus agent, and draft a professional reply.`;

    console.log(`Processing email: "${emailSubject}" from ${emailFrom}`);

    const aiResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.4,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('OnSpace AI error:', errorText);
      throw new Error(`OnSpace AI: ${aiResponse.status} — ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content ?? '';

    console.log('AI raw response length:', rawContent.length);

    // Clean the response — strip any markdown code fences if present
    const cleaned = rawContent
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('JSON parse failed. Raw content:', rawContent);
      throw new Error(`Failed to parse AI response as JSON: ${parseErr}`);
    }

    // Validate required fields
    const required = ['category', 'campusId', 'agentName', 'faculty', 'confidence', 'reasoning', 'draftReply'];
    for (const field of required) {
      if (!parsed[field]) {
        throw new Error(`AI response missing required field: ${field}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, result: parsed }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('process-email error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
