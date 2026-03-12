import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const FALLBACK_QUESTIONS = `ASK THESE QUESTIONS NEXT (one at a time, wait for each answer):
1. What's the frequency for bitewings and when were they last done?
2. What's the frequency for panoramic x-ray and when was it last done?
3. What's the frequency for full mouth x-rays and when was it last done?
4. What's the frequency for comprehensive exam D zero one fifty, and when was it last done?
5. What's the frequency for periodic exam D zero one twenty, and when was it last done?

After getting answers, call getNextQuestions again.`;

const REQUIRED_FIELDS_FOR_GAP_ANALYSIS = `Required dental verification fields (check each against the transcript):

ELIGIBILITY: patient eligible, effective date, in/out network, PPO/HMO/DMO plan type, fee schedule, plan or group name, group number, claims mailing address, payor ID
BENEFITS: annual maximum, amount used, amount remaining, what maximum applies to, deductible amount, deductible met (yes/no), what deductible applies to, ortho maximum, ortho maximum used
WAITING PERIODS: preventive waiting period, basic waiting period, major waiting period
CLAUSES: missing tooth clause
COVERAGE %: diagnostic %, preventive %, basic %, major %, endodontics %, periodontics %, extractions %
DIAGNOSTIC: bitewing frequency, bitewing last done, pano frequency, pano last done, FMX frequency, FMX last done, D0150 comp exam frequency, D0150 last done, D0120 periodic exam frequency, D0120 last done, D0140 limited exam frequency, do exams share frequency
PREVENTIVE: D1110 prophy frequency, D1110 last done, D4346 coverage %, D4346 frequency, D4346 shares with prophy?, fluoride covered?, fluoride age limit, fluoride frequency
BASIC: filling downgrades to amalgam?
MAJOR: crown downgrades?, crown replacement frequency
EXTRACTIONS: D7210 surgical extraction coverage %, D7140 simple extraction coverage %
PERIODONTICS: D4910 perio maintenance coverage %, D4910 frequency, D4341 SRP frequency, D4341 last done, D4342 frequency, D4342 last done
IMPLANTS: implants covered?, D6010 coverage %, D6057 coverage %, D6058 coverage %
OCCLUSAL GUARD: covered?, coverage %
WRAP UP: limitations/exclusions, call reference number, rep name`;

async function analyzeTranscriptForGaps(transcript: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY || !transcript) {
    return FALLBACK_QUESTIONS;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0,
        messages: [
          {
            role: "system",
            content: `You analyze dental insurance verification call transcripts to determine what questions still need to be asked.

Given a transcript of an in-progress call and a list of required fields, determine which fields have been answered and which are still MISSING. Then return the NEXT 4-5 specific questions to ask.

## Rules
- A field is "covered" ONLY if the insurance rep EXPLICITLY provided a clear answer — including "no", "not covered", "N/A", "as needed", "none on file"
- Volunteered information counts as covered even if the assistant didn't ask for it
- If a field was asked but the rep said "let me check" or "hold on" with no follow-up answer, it's MISSING
- If the assistant asked about multiple items at once and the rep only answered SOME of them, the unanswered ones are MISSING

## CRITICAL: These Are SEPARATE Fields — Do NOT Conflate Them
Each of these is a DIFFERENT field. Answering one does NOT answer the other:
- D7210 (surgical extraction) ≠ D7140 (simple extraction) — they are completely different codes
- D4341 (SRP by quadrant) ≠ D4342 (SRP by sextant) — different codes, different frequencies
- D4910 coverage % ≠ D4910 frequency — coverage is the percentage, frequency is how often
- D4346 coverage % ≠ D4346 frequency — two separate pieces of information
- Crown downgrade (yes/no) ≠ Crown replacement frequency (how often)
- Fluoride covered (yes/no) ≠ Fluoride age limit ≠ Fluoride frequency — three separate fields
- D0150 (comp exam) ≠ D0120 (periodic exam) ≠ D0140 (limited exam) — three different exam types
- Each diagnostic code needs BOTH frequency AND history (last done date) — frequency alone doesn't count as covering history

## Transcript Quality Warning
Phone call transcripts often have garbled text. Watch for:
- "D" being transcribed as "Z", "G", or "d r" (e.g., "Z zero one forty" = D0140, "G4910" = D4910)
- "Downgrade" being transcribed as "On grade" or "down grade"
- "Fluoride" being transcribed as "Flora" or "floride"
- Numbers being garbled (e.g., "a 100%" might be "a hundred percent")
Interpret these charitably but ONLY mark a field as covered if you can clearly determine the answer.

## Before Saying "VERIFICATION COMPLETE"
You MUST mentally verify EACH of these specific items has been explicitly answered:
1. Payor ID
2. Deductible applies to (what services)
3. D0120 periodic exam frequency AND history
4. D0140 limited exam frequency
5. Do exams share frequency with each other
6. D1110 prophy frequency AND history
7. D4346 coverage AND frequency AND shares with prophy
8. Fluoride covered AND age limit AND frequency
9. Downgrade fillings to amalgam (yes/no)
10. Crown downgrade AND crown replacement frequency
11. D7210 surgical extraction coverage AND D7140 simple extraction coverage (BOTH needed)
12. D4910 coverage AND frequency
13. D4341 frequency AND history AND D4342 frequency AND history (ALL FOUR needed)
14. Implants covered (and if yes: D6010, D6057, D6058 coverage)
15. Occlusal guard covered AND coverage %
If ANY of these are not explicitly answered in the transcript, return them as questions. Do NOT say VERIFICATION COMPLETE.

## Output Format
If there ARE missing fields:

ASK THESE QUESTIONS NEXT (one at a time, wait for each answer):
1. [specific question including CDT code pronunciation]
2. [question]
3. [question]
4. [question]

After getting answers, call getNextQuestions again.

If ALL required fields are genuinely covered:

VERIFICATION COMPLETE — all required fields have been covered. Ask for a reference number and the rep's name, then end the call.

## CDT Code Pronunciations
D0150 = "D zero one fifty", D0120 = "D zero one twenty", D0140 = "D zero one forty"
D0210 = "D zero two ten", D0220 = "D zero two twenty", D0274 = "D zero two seventy-four", D0330 = "D zero three thirty"
D1110 = "D eleven ten", D1208 = "D twelve oh eight"
D4346 = "D forty-three forty-six", D4341 = "D forty-three forty-one", D4342 = "D forty-three forty-two"
D4910 = "D forty-nine ten"
D6010 = "D sixty ten", D6057 = "D sixty fifty-seven", D6058 = "D sixty fifty-eight"
D7140 = "D seventy-one forty", D7210 = "D seventy-two ten"
D9944 = "D ninety-nine forty-four"

## Important
- Return at most 5 questions at a time
- Group related questions together
- Start with the most critical missing fields first`,
          },
          {
            role: "user",
            content: `REQUIRED FIELDS:\n${REQUIRED_FIELDS_FOR_GAP_ANALYSIS}\n\nTRANSCRIPT:\n${transcript}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("OpenAI gap analysis error:", response.status);
      return FALLBACK_QUESTIONS;
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;
    if (!result) return FALLBACK_QUESTIONS;

    console.log("Gap analysis result:", result);
    return result;
  } catch (error) {
    console.error("Gap analysis failed:", error);
    return FALLBACK_QUESTIONS;
  }
}

const STRUCTURED_DATA_SCHEMA = {
  insurance_company: "string", rep_name: "string", call_reference: "string",
  subscriber_id: "string", patient_name: "string", patient_dob: "string",
  subscriber_name: "string", subscriber_dob: "string", effective_date: "string",
  relationship_to_subscriber: "string", patient_eligible: "boolean",
  in_network: "boolean", plan_type: "string", fee_schedule: "string",
  plan_group_name: "string", group_number: "string", claims_mailing_address: "string",
  payor_id: "string", annual_maximum: "number", maximum_used: "number",
  maximum_remaining: "number", maximum_applies_to: "string", deductible: "number",
  deductible_met: "boolean", deductible_amount_met: "number",
  deductible_applies_to: "string", ortho_maximum: "number", ortho_maximum_used: "number",
  waiting_period_preventive: "string", waiting_period_basic: "string",
  waiting_period_major: "string", missing_tooth_clause: "boolean",
  coverage_diagnostic: "number", coverage_preventive: "number", coverage_basic: "number",
  coverage_major: "number", coverage_extractions: "number", coverage_endodontics: "number",
  coverage_periodontics: "number", frequency_bwx: "string", history_bwx: "string",
  frequency_pano: "string", history_pano: "string", frequency_fmx: "string",
  history_fmx: "string", frequency_d0150: "string", history_d0150: "string",
  frequency_d0120: "string", history_d0120: "string", frequency_d0140: "string",
  history_d0140: "string", exams_share_frequency: "boolean", frequency_d1110: "string",
  history_d1110: "string", coverage_d4346: "number", frequency_d4346: "string",
  d4346_shares_with_d1110: "boolean", fluoride_covered: "boolean",
  fluoride_age_limit: "string", fluoride_frequency: "string",
  downgrade_fillings: "boolean", downgrade_crowns: "boolean",
  frequency_crowns: "string", coverage_d7210: "number", coverage_d7140: "number",
  coverage_d4910: "number", frequency_d4910: "string", frequency_d4341: "string",
  history_d4341: "string", frequency_d4342: "string", history_d4342: "string",
  implants_covered: "boolean", coverage_d6010: "number", coverage_d6057: "number",
  coverage_d6058: "number", occlusal_guard_covered: "boolean",
  occlusal_guard_coverage: "number", notes: "string",
};

async function parseTranscriptWithAI(transcript: string): Promise<VapiStructuredResult> {
  if (!process.env.OPENAI_API_KEY || !transcript) return {};

  try {
    const fieldList = Object.entries(STRUCTURED_DATA_SCHEMA)
      .map(([k, t]) => `  "${k}": ${t}`)
      .join("\n");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `Extract dental insurance verification data from this phone call transcript. Return a JSON object with ONLY fields that were explicitly stated by the insurance representative. Use null for anything not discussed.\n\nSpecial rules:\n- If the rep says there is NO ortho benefit or no ortho coverage, set ortho_maximum to 0.\n- If the rep says implants are not covered, set implants_covered to false.\n\nFields:\n${fieldList}\n\nReturn valid JSON only.`,
          },
          {
            role: "user",
            content: transcript,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("OpenAI API error:", response.status, await response.text());
      return {};
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return {};

    const parsed = JSON.parse(content);
    // Strip null values
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (v !== null && v !== undefined) result[k] = v;
    }
    return result as VapiStructuredResult;
  } catch (error) {
    console.error("Failed to parse transcript with OpenAI:", error);
    return {};
  }
}

// Vapi structured output format - comprehensive dental insurance verification
interface VapiStructuredResult {
  // Header Info
  insurance_company?: string;
  rep_name?: string;
  call_reference?: string;
  subscriber_id?: string;
  patient_name?: string;
  patient_dob?: string;
  subscriber_name?: string;
  subscriber_dob?: string;
  effective_date?: string;
  relationship_to_subscriber?: string;

  // Eligibility & Plan Info
  patient_eligible?: boolean;
  in_network?: boolean;
  plan_type?: string;
  fee_schedule?: string;
  plan_group_name?: string;
  group_number?: string;
  claims_mailing_address?: string;
  payor_id?: string;

  // Maximums & Deductibles
  annual_maximum?: number;
  maximum_used?: number;
  maximum_remaining?: number;
  maximum_applies_to?: string;
  deductible?: number;
  deductible_met?: boolean;
  deductible_amount_met?: number;
  deductible_applies_to?: string;
  ortho_maximum?: number;
  ortho_maximum_used?: number;

  // Waiting Periods
  waiting_period_preventive?: string;
  waiting_period_basic?: string;
  waiting_period_major?: string;

  // Clauses
  missing_tooth_clause?: boolean;

  // Coverage Percentages
  coverage_diagnostic?: number;
  coverage_preventive?: number;
  coverage_basic?: number;
  coverage_major?: number;
  coverage_extractions?: number;
  coverage_endodontics?: number;
  coverage_periodontics?: number;

  // Diagnostic - Frequencies & History
  frequency_bwx?: string;
  history_bwx?: string;
  frequency_pano?: string;
  history_pano?: string;
  frequency_fmx?: string;
  history_fmx?: string;
  frequency_d0150?: string;
  history_d0150?: string;
  frequency_d0120?: string;
  history_d0120?: string;
  frequency_d0140?: string;
  history_d0140?: string;
  exams_share_frequency?: boolean;

  // Preventive
  frequency_d1110?: string;
  history_d1110?: string;
  coverage_d4346?: number;
  frequency_d4346?: string;
  d4346_shares_with_d1110?: boolean;
  fluoride_covered?: boolean;
  fluoride_age_limit?: string;
  fluoride_frequency?: string;

  // Basic
  downgrade_fillings?: boolean;

  // Major
  downgrade_crowns?: boolean;
  frequency_crowns?: string;

  // Extractions
  coverage_d7210?: number;
  coverage_d7140?: number;

  // Periodontics
  coverage_d4910?: number;
  frequency_d4910?: string;
  frequency_d4341?: string;
  history_d4341?: string;
  frequency_d4342?: string;
  history_d4342?: string;

  // Implants
  implants_covered?: boolean;
  coverage_d6010?: number;
  coverage_d6057?: number;
  coverage_d6058?: number;

  // Occlusal Guard
  occlusal_guard_covered?: boolean;
  occlusal_guard_coverage?: number;

  // Notes
  notes?: string;

  // Legacy field names (backwards compatibility)
  member_id?: string;
  insurance_carrier?: string;
  remaining_maximum?: number;
  preventive_coverage?: number;
  basic_coverage?: number;
  major_coverage?: number;
  frequency_prophy?: string;
  history_prophy?: string;
  prophy_frequency?: string;
  frequency_exams?: string;
  history_exams?: string;
  frequency_srp?: string;
  bwx_frequency?: string;
  pano_frequency?: string;
  reference_number?: string;
  implant_coverage_percentage?: number;
  crowns_covered?: boolean;
  crown_coverage_percentage?: number;
}

interface VapiToolOutput {
  name: string;
  result: VapiStructuredResult;
  compliancePlan?: unknown;
}

interface VapiWebhookPayload {
  message: {
    type: string;
    toolCallList?: Array<{
      id: string;
      name: string;
      arguments?: Record<string, unknown>;
    }>;
    call?: {
      id: string;
      status: string;
      endedReason?: string;
      recordingUrl?: string;
      transcript?: string;
      stereoRecordingUrl?: string;
      duration?: number;
      metadata?: {
        practiceId?: string;
        verificationId?: string;
        [key: string]: unknown;
      };
    };
    artifact?: {
      recordingUrl?: string;
      stereoRecordingUrl?: string;
      transcript?: string;
      messages?: Array<{ role: string; message: string }>;
      structuredOutputs?: Record<string, VapiToolOutput>;
    };
    analysis?: {
      structuredData?: Record<string, VapiToolOutput>;
      summary?: string;
    };
  };
}

// Deep merge benefits: fill in nulls from incoming, don't overwrite existing data with null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mergeBenefits(existing: Record<string, any>, incoming: Record<string, any>): Record<string, any> {
  const result = { ...existing };

  for (const key of Object.keys(incoming)) {
    const incomingVal = incoming[key];
    const existingVal = existing[key];

    // Skip incoming null/undefined — don't overwrite existing data with nothing
    if (incomingVal === null || incomingVal === undefined) continue;

    // Special case: concatenate notes fields
    if (key === "notes" && typeof existingVal === "string" && typeof incomingVal === "string") {
      result[key] = existingVal + "\n---\n" + incomingVal;
      continue;
    }

    // Recurse into nested objects (not arrays or primitives)
    if (
      typeof incomingVal === "object" && !Array.isArray(incomingVal) &&
      typeof existingVal === "object" && existingVal !== null && !Array.isArray(existingVal)
    ) {
      result[key] = mergeBenefits(existingVal, incomingVal);
      continue;
    }

    // For primitives: if existing is null/undefined, take incoming; if both exist, take incoming (trust newer data)
    if (existingVal === null || existingVal === undefined) {
      result[key] = incomingVal;
    } else {
      // Both exist — take incoming (newer data)
      result[key] = incomingVal;
    }
  }

  return result;
}

export async function POST(request: Request) {
  try {
    const payload: VapiWebhookPayload = await request.json();

    console.log("Vapi webhook received:", JSON.stringify(payload, null, 2));

    const messageType = payload.message?.type;

    // Handle end-of-call-report which contains the final data
    if (messageType === "end-of-call-report") {
      const call = payload.message.call;
      const artifact = payload.message.artifact;
      const analysis = payload.message.analysis;

      // Extract metadata (set when calls are triggered from the app)
      const practiceId = call?.metadata?.practiceId || null;
      const verificationId = call?.metadata?.verificationId || null;

      // Extract structured data - check multiple locations
      let structuredResult: VapiStructuredResult = {};

      // Primary: artifact.structuredOutputs (from tool calls during conversation)
      if (artifact?.structuredOutputs) {
        const toolOutputs = Object.values(artifact.structuredOutputs);
        if (toolOutputs.length > 0 && toolOutputs[0].result) {
          structuredResult = toolOutputs[0].result;
        }
      }
      // Fallback 1: analysis.structuredData as tool output wrapper
      else if (analysis?.structuredData) {
        const values = Object.values(analysis.structuredData);
        if (values.length > 0 && typeof values[0] === "object" && values[0] !== null && "result" in (values[0] as unknown as Record<string, unknown>)) {
          structuredResult = (values[0] as VapiToolOutput).result;
        }
        // Fallback 2: analysis.structuredData as flat object (from structuredDataPlan)
        else if ("patient_eligible" in analysis.structuredData || "annual_maximum" in analysis.structuredData || "plan_type" in analysis.structuredData || "coverage_diagnostic" in analysis.structuredData) {
          structuredResult = analysis.structuredData as unknown as VapiStructuredResult;
        }
      }

      // Fallback 3: Parse transcript with OpenAI if no structured data from Vapi
      const hasStructuredData = structuredResult.patient_eligible !== undefined || structuredResult.annual_maximum !== undefined || structuredResult.plan_type !== undefined;
      if (!hasStructuredData) {
        const transcript = artifact?.transcript || call?.transcript;
        if (transcript) {
          console.log("No structured data from Vapi — parsing transcript with OpenAI");
          structuredResult = await parseTranscriptWithAI(transcript);
        }
      }

      // Extract patient info - check structured output first, then system prompt
      let patientName = structuredResult.patient_name;
      let patientDOB = structuredResult.patient_dob;
      let memberId = structuredResult.subscriber_id || structuredResult.member_id;
      let insuranceCarrier = structuredResult.insurance_company || structuredResult.insurance_carrier;

      // Try to extract from the system prompt in messages if not in structured output
      if (!patientName && artifact?.messages) {
        const systemMessage = artifact.messages.find(m => m.role === "system");
        if (systemMessage?.message) {
          const nameMatch = systemMessage.message.match(/Patient:\s*([^\n]+)/i);
          const dobMatch = systemMessage.message.match(/DOB:\s*([^\n]+)/i);
          const memberMatch = systemMessage.message.match(/Member ID:\s*([^\n]+)/i);

          if (nameMatch) patientName = nameMatch[1].trim();
          if (dobMatch) patientDOB = dobMatch[1].trim();
          if (memberMatch) memberId = memberMatch[1].trim().replace(/\s+/g, '');
        }
      }

      // Determine status based on call outcome and whether we got data
      const hasAnyBenefitsData = structuredResult.patient_eligible !== undefined
        || structuredResult.annual_maximum !== undefined
        || structuredResult.plan_type !== undefined
        || structuredResult.coverage_basic !== undefined;

      let status = "completed";
      // Only fail if call ended abnormally AND we got NO benefits data
      if (call?.endedReason && !["customer-ended-call", "assistant-ended-call", "hangup"].includes(call.endedReason) && !hasAnyBenefitsData) {
        status = "failed";
      }
      // Also fail if we got absolutely nothing regardless of end reason
      if (!hasAnyBenefitsData) {
        status = "failed";
      }

      // Calculate duration string
      let callDuration: string | undefined;
      if (call?.duration) {
        const minutes = Math.floor(call.duration / 60);
        const seconds = Math.round(call.duration % 60);
        callDuration = `${minutes} min ${seconds} sec`;
      }

      // Build comprehensive benefits object grouped by service category
      const benefits = {
        // Eligibility
        eligible: structuredResult.patient_eligible,
        effectiveDate: structuredResult.effective_date,
        inNetwork: structuredResult.in_network,

        // Plan Info
        planType: structuredResult.plan_type,
        feeSchedule: structuredResult.fee_schedule,
        planGroupName: structuredResult.plan_group_name,
        groupNumber: structuredResult.group_number,
        claimsMailingAddress: structuredResult.claims_mailing_address,
        payorId: structuredResult.payor_id,

        // Subscriber Info
        subscriberName: structuredResult.subscriber_name,
        subscriberDOB: structuredResult.subscriber_dob,
        relationshipToSubscriber: structuredResult.relationship_to_subscriber,

        // Maximums
        annualMaximum: structuredResult.annual_maximum,
        maximumUsed: structuredResult.maximum_used,
        remainingMaximum: structuredResult.maximum_remaining || structuredResult.remaining_maximum,
        maximumAppliesTo: structuredResult.maximum_applies_to,

        // Deductible
        deductible: structuredResult.deductible,
        deductibleMet: structuredResult.deductible_met,
        deductibleAmountMet: structuredResult.deductible_amount_met,
        deductibleAppliesTo: structuredResult.deductible_applies_to,

        // Ortho
        orthoMaximum: structuredResult.ortho_maximum,
        orthoMaximumUsed: structuredResult.ortho_maximum_used,

        // Waiting Periods
        waitingPeriods: {
          preventive: structuredResult.waiting_period_preventive,
          basic: structuredResult.waiting_period_basic,
          major: structuredResult.waiting_period_major,
        },

        // Clauses
        missingToothClause: structuredResult.missing_tooth_clause,
        downgradeCrowns: structuredResult.downgrade_crowns,
        downgradeFillings: structuredResult.downgrade_fillings,

        // Coverage Percentages
        coverage: {
          diagnostic: structuredResult.coverage_diagnostic,
          preventive: structuredResult.coverage_preventive || structuredResult.preventive_coverage,
          basic: structuredResult.coverage_basic || structuredResult.basic_coverage,
          major: structuredResult.coverage_major || structuredResult.major_coverage,
          extractions: structuredResult.coverage_extractions,
          endodontics: structuredResult.coverage_endodontics,
          periodontics: structuredResult.coverage_periodontics,
        },

        // Diagnostic codes
        diagnostic: {
          bwx: { frequency: structuredResult.frequency_bwx || structuredResult.bwx_frequency, history: structuredResult.history_bwx },
          pano: { frequency: structuredResult.frequency_pano || structuredResult.pano_frequency, history: structuredResult.history_pano },
          fmx: { frequency: structuredResult.frequency_fmx, history: structuredResult.history_fmx },
          d0150: { frequency: structuredResult.frequency_d0150, history: structuredResult.history_d0150 },
          d0120: { frequency: structuredResult.frequency_d0120, history: structuredResult.history_d0120 },
          d0140: { frequency: structuredResult.frequency_d0140, history: structuredResult.history_d0140 },
          examsShareFrequency: structuredResult.exams_share_frequency,
        },

        // Preventive codes
        preventive: {
          d1110: {
            frequency: structuredResult.frequency_d1110 || structuredResult.frequency_prophy || structuredResult.prophy_frequency,
            history: structuredResult.history_d1110 || structuredResult.history_prophy,
          },
          d4346: {
            coverage: structuredResult.coverage_d4346,
            frequency: structuredResult.frequency_d4346,
            sharesWithD1110: structuredResult.d4346_shares_with_d1110,
          },
          fluoride: {
            covered: structuredResult.fluoride_covered,
            ageLimit: structuredResult.fluoride_age_limit,
            frequency: structuredResult.fluoride_frequency,
          },
        },

        // Extractions codes
        extractions: {
          d7210: { coverage: structuredResult.coverage_d7210 },
          d7140: { coverage: structuredResult.coverage_d7140 },
        },

        // Periodontics codes
        periodontics: {
          d4910: { coverage: structuredResult.coverage_d4910, frequency: structuredResult.frequency_d4910 },
          d4341: { frequency: structuredResult.frequency_d4341 || structuredResult.frequency_srp, history: structuredResult.history_d4341 },
          d4342: { frequency: structuredResult.frequency_d4342, history: structuredResult.history_d4342 },
        },

        // Major codes
        major: {
          crowns: {
            frequency: structuredResult.frequency_crowns,
            covered: structuredResult.crowns_covered,
            coverage: structuredResult.crown_coverage_percentage,
          },
        },

        // Implants
        implants: {
          covered: structuredResult.implants_covered,
          d6010: { coverage: structuredResult.coverage_d6010 || structuredResult.implant_coverage_percentage },
          d6057: { coverage: structuredResult.coverage_d6057 },
          d6058: { coverage: structuredResult.coverage_d6058 },
        },

        // Occlusal Guard
        occlusialGuard: {
          covered: structuredResult.occlusal_guard_covered,
          coverage: structuredResult.occlusal_guard_coverage,
        },

        // Notes
        notes: structuredResult.notes,
      };

      // Update existing record (call triggered from app) or create new one (external call)
      let verification;

      if (verificationId) {
        const isContinuation = call?.metadata?.isContinuation === "true";

        if (isContinuation) {
          // Fetch existing record to merge data
          const existingRecord = await prisma.verification.findUnique({
            where: { id: verificationId },
          });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let finalBenefits: Record<string, any> = benefits;
          let finalTranscript = artifact?.transcript || call?.transcript;
          let finalReferenceNumber = structuredResult.call_reference || structuredResult.reference_number;
          let finalRepName = structuredResult.rep_name;
          let finalStatus = status;

          if (existingRecord) {
            // Merge benefits: existing + new incoming
            if (existingRecord.benefits) {
              try {
                const existingBenefits = JSON.parse(existingRecord.benefits as string);
                finalBenefits = mergeBenefits(existingBenefits, benefits);
              } catch {
                // If parse fails, use new benefits as-is
              }
            }

            // Concatenate transcripts with separator
            if (existingRecord.transcript && finalTranscript) {
              finalTranscript = existingRecord.transcript + "\n\n--- CONTINUATION CALL ---\n\n" + finalTranscript;
            } else if (existingRecord.transcript) {
              finalTranscript = existingRecord.transcript;
            }

            // Keep existing reference/rep if continuation didn't get new ones
            if (!finalReferenceNumber && existingRecord.referenceNumber) {
              finalReferenceNumber = existingRecord.referenceNumber;
            }
            if (!finalRepName && existingRecord.repName) {
              finalRepName = existingRecord.repName;
            }

            // Don't downgrade from completed to failed if existing benefits are valid
            if (finalStatus === "failed" && existingRecord.status === "completed") {
              finalStatus = "completed";
            }
          }

          verification = await prisma.verification.update({
            where: { id: verificationId },
            data: {
              status: finalStatus,
              callDuration,
              recordingUrl: artifact?.recordingUrl || artifact?.stereoRecordingUrl || call?.recordingUrl || existingRecord?.recordingUrl,
              transcript: finalTranscript,
              benefits: JSON.stringify(finalBenefits),
              referenceNumber: finalReferenceNumber,
              repName: finalRepName,
              ...(patientName && patientName !== "Unknown Patient" ? { patientName } : {}),
              ...(insuranceCarrier ? { insuranceCarrier } : {}),
            },
          });
          console.log("Verification updated (continuation merge):", verification.id);
        } else {
          verification = await prisma.verification.update({
            where: { id: verificationId },
            data: {
              status,
              callDuration,
              recordingUrl: artifact?.recordingUrl || artifact?.stereoRecordingUrl || call?.recordingUrl,
              transcript: artifact?.transcript || call?.transcript,
              benefits: JSON.stringify(benefits),
              referenceNumber: structuredResult.call_reference || structuredResult.reference_number,
              repName: structuredResult.rep_name,
              // Only overwrite patient info if structured output has real values
              ...(patientName && patientName !== "Unknown Patient" ? { patientName } : {}),
              ...(insuranceCarrier ? { insuranceCarrier } : {}),
            },
          });
          console.log("Verification updated:", verification.id);
        }
      } else {
        verification = await prisma.verification.create({
          data: {
            status,
            patientName: patientName || "Unknown Patient",
            patientDOB: patientDOB || "",
            memberId: memberId || "",
            insuranceCarrier: insuranceCarrier || "",
            callDuration,
            recordingUrl: artifact?.recordingUrl || artifact?.stereoRecordingUrl || call?.recordingUrl,
            transcript: artifact?.transcript || call?.transcript,
            benefits: JSON.stringify(benefits),
            referenceNumber: structuredResult.call_reference || structuredResult.reference_number,
            repName: structuredResult.rep_name,
            practiceId,
          },
        });
        console.log("Verification created:", verification.id);
      }

      return NextResponse.json({
        success: true,
        verificationId: verification.id,
      });
    }

    // Handle tool-calls from Vapi (e.g. getNextQuestions)
    if (messageType === "tool-calls") {
      const toolCallList = payload.message?.toolCallList || [];

      // Extract transcript from the payload for gap analysis
      let currentTranscript = "";
      let transcriptSource = "none";

      // Try 1: artifact.transcript
      if (payload.message.artifact?.transcript) {
        currentTranscript = payload.message.artifact.transcript;
        transcriptSource = "artifact.transcript";
      }
      // Try 2: call.transcript
      else if (payload.message.call?.transcript) {
        currentTranscript = payload.message.call.transcript;
        transcriptSource = "call.transcript";
      }

      // Try 3: Build from artifact messages (skip system message, it's the full prompt)
      if (!currentTranscript && payload.message.artifact?.messages) {
        const conversationMessages = payload.message.artifact.messages
          .filter(m => m.role !== "system")
          .map(m => `${m.role}: ${m.message}`);
        if (conversationMessages.length > 0) {
          currentTranscript = conversationMessages.join("\n");
          transcriptSource = "artifact.messages";
        }

        // Also check for continuation data in system message
        const systemMsg = payload.message.artifact.messages.find(m => m.role === "system");
        if (systemMsg?.message?.includes("PREVIOUSLY COLLECTED DATA")) {
          const match = systemMsg.message.match(/## PREVIOUSLY COLLECTED DATA[\s\S]+?(?=##|$)/);
          if (match) {
            currentTranscript = match[0] + "\n\n---\n\n" + currentTranscript;
            transcriptSource += "+continuation";
          }
        }
      }

      // Try 4: Fetch from Vapi API using call ID
      if (!currentTranscript && payload.message.call?.id && process.env.VAPI_API_KEY) {
        try {
          const vapiRes = await fetch(`https://api.vapi.ai/call/${payload.message.call.id}`, {
            headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` },
          });
          if (vapiRes.ok) {
            const callData = await vapiRes.json();
            currentTranscript = callData.artifact?.transcript
              || callData.transcript
              || "";
            if (currentTranscript) transcriptSource = "vapi-api";
          }
        } catch (e) {
          console.error("Failed to fetch transcript from Vapi:", e);
        }
      }

      console.log(`Tool-call transcript source: ${transcriptSource}, length: ${currentTranscript.length}`);

      const results = await Promise.all(
        toolCallList.map(async (toolCall) => {
          if (toolCall.name === "getNextQuestions" || toolCall.name === "getRemainingQuestions") {
            if (currentTranscript && currentTranscript.length > 100) {
              const gapResult = await analyzeTranscriptForGaps(currentTranscript);
              console.log(`getNextQuestions result (${transcriptSource}):`, gapResult.substring(0, 200));
              return { toolCallId: toolCall.id, result: gapResult };
            }
            console.log("getNextQuestions: no transcript available, using fallback");
            return { toolCallId: toolCall.id, result: FALLBACK_QUESTIONS };
          }
          return { toolCallId: toolCall.id, result: "Unknown tool" };
        })
      );

      return NextResponse.json({ results });
    }

    // For other message types (status-update, transcript, etc.), just acknowledge
    return NextResponse.json({ success: true, message: `Received ${messageType}` });

  } catch (error) {
    console.error("Vapi webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Also handle GET for webhook verification if needed
export async function GET() {
  return NextResponse.json({ status: "Vapi webhook endpoint active" });
}
