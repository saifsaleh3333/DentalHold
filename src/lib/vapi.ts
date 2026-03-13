import { VapiClient, VapiError } from "@vapi-ai/server-sdk";

interface PracticeInfo {
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  fax: string | null;
  npiPractice: string | null;
  npiIndividual: string | null;
  taxId: string | null;
  dentistName: string | null;
}

interface PatientInfo {
  patientName: string;
  patientDOB: string;
  patientAddress?: string;
  memberId: string;
  groupNumber?: string;
  patientSSN?: string;
}

interface SubscriberInfo {
  subscriberName: string;
  subscriberDOB: string;
}

interface TriggerCallParams {
  phoneNumber: string;
  practice: PracticeInfo;
  patient: PatientInfo;
  subscriber?: SubscriberInfo | null;
  practiceId: string;
  verificationId: string;
  isContinuation?: boolean;
  existingBenefits?: Record<string, unknown>;
}

interface VapiCallResponse {
  id: string;
  status: string;
  [key: string]: unknown;
}

export function normalizePhoneNumber(input: string): string {
  const digits = input.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }
  throw new Error("Invalid phone number. Please enter a 10-digit US phone number.");
}

export function formatDateForSpeech(isoDate: string): string {
  const date = new Date(isoDate + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatAlphanumericForSpeech(id: string): string {
  // Convert each character to speech-friendly format
  // Letters stay as letters, digits get spoken as words
  return id
    .toUpperCase()
    .split("")
    .map((char) => {
      if (char === "0") return "zero";
      if (char === "1") return "one";
      if (char === "2") return "two";
      if (char === "3") return "three";
      if (char === "4") return "four";
      if (char === "5") return "five";
      if (char === "6") return "six";
      if (char === "7") return "seven";
      if (char === "8") return "eight";
      if (char === "9") return "nine";
      return char; // Keep letters as-is
    })
    .join(", ");
}

function buildPracticeSection(practice: PracticeInfo): string {
  const address = [practice.address, practice.city, practice.state, practice.zip]
    .filter(Boolean)
    .join(", ");

  const npiIndividual = practice.npiIndividual
    ? formatAlphanumericForSpeech(practice.npiIndividual)
    : "N/A";
  const npiPractice = practice.npiPractice
    ? formatAlphanumericForSpeech(practice.npiPractice)
    : "N/A";
  const taxId = practice.taxId
    ? formatAlphanumericForSpeech(practice.taxId)
    : "N/A";

  return `## Practice Info (give when asked)
Practice Name: ${practice.name}
Treating Dentist: ${practice.dentistName || "N/A"}
Practice Address: ${address || "N/A"}
Practice Phone: ${practice.phone || "N/A"}
Fax: ${practice.fax || "N/A"}
Callback Number: ${practice.phone || "N/A"} (same as practice phone)
Dentist (Individual) NPI: ${npiIndividual}
Practice (Group) NPI: ${npiPractice}
Tax ID: ${taxId}

NOTE: If the rep asks for "the NPI," give the Practice NPI first (${npiPractice}). If they specifically ask for the individual or rendering provider NPI, give ${npiIndividual}.
If asked for the dentist's name or the treating/rendering provider, say: "${practice.dentistName || "N/A"}".
If asked "Is this for a specific procedure?" say: "No, I'm verifying general benefits and eligibility for a new patient."`;
}

function buildPatientSection(patient: PatientInfo): string {
  const ssnAvailable = patient.patientSSN ? "YES" : "NO";
  const ssnValue = patient.patientSSN
    ? formatAlphanumericForSpeech(patient.patientSSN)
    : "NOT AVAILABLE";
  const groupNumberValue = patient.groupNumber
    ? formatAlphanumericForSpeech(patient.groupNumber)
    : "NOT AVAILABLE";
  const addressValue = patient.patientAddress || "NOT AVAILABLE";

  return `## Patient Info (ONLY give when the rep asks — NEVER volunteer)
Patient Name: ${patient.patientName}
Patient DOB: ${patient.patientDOB}
Patient Address: ${addressValue}
Member ID: ${formatAlphanumericForSpeech(patient.memberId)}
${patient.groupNumber ? `Group Number: ${groupNumberValue}` : "Group Number: NOT AVAILABLE"}
SSN Available: ${ssnAvailable}
${patient.patientSSN ? `Subscriber SSN: ${ssnValue}` : ""}

IMPORTANT: Do NOT give the patient name, DOB, and member ID all at once. Wait for the rep to ask for each piece of information separately. When the rep asks for the patient name, say the full name clearly and then spell BOTH the first and last name letter by letter (e.g. "The patient is Saif Saleh. First name S as in Sam, A as in Apple, I as in India, F as in Frank. Last name S as in Sam, A as in Apple, L as in Larry, E as in Echo, H as in Hotel."). Then STOP and wait for the rep to ask for the next piece of info.

ADDRESS: If the rep asks for the patient's or member's address, ${patient.patientAddress ? `provide: "${addressValue}"` : `say: "I don't have the address on file. Is there another way to verify the member?"`}

GROUP NUMBER: If the rep asks for the group number or group ID, provide: "${groupNumberValue}". Note: The group number is DIFFERENT from the member ID. Do not confuse them.

${patient.patientSSN ? `SSN INSTRUCTIONS: If the rep asks for SSN, Social Security Number, or "last four of social", provide it: "${ssnValue}". You can also OFFER the SSN if the rep says the member ID is not working or they can't find the patient.` : "SSN INSTRUCTIONS: You do NOT have the patient's SSN. If the rep asks for it, say: \"I'm sorry, I don't have the Social Security Number available. Is there another way to verify?\""}`;
}

function buildSubscriberSection(subscriber?: SubscriberInfo | null): string {
  if (subscriber?.subscriberName) {
    return `## Subscriber Info
Subscriber Name: ${subscriber.subscriberName}
Subscriber DOB: ${subscriber.subscriberDOB}
The patient is NOT the subscriber. If the rep asks "Is the patient the subscriber?" say "No, the subscriber is ${subscriber.subscriberName}, date of birth ${subscriber.subscriberDOB}." Only give subscriber info when the rep asks for it.`;
  }
  return `## Subscriber Info
The patient is the subscriber. If the rep asks "Is the patient the subscriber?" say "Yes, the patient is the subscriber."`;
}

// Section labels matching the 14 verification question sections
const BENEFITS_SECTIONS: Record<string, { label: string; fields: Record<string, string> }> = {
  eligibility: {
    label: "Eligibility & Plan Info",
    fields: {
      eligible: "Patient Eligible",
      effectiveDate: "Effective Date",
      inNetwork: "In Network",
      planType: "Plan Type",
      feeSchedule: "Fee Schedule",
      planGroupName: "Plan/Group Name",
      groupNumber: "Group Number",
      claimsMailingAddress: "Claims Mailing Address",
      payorId: "Payor ID",
    },
  },
  benefits: {
    label: "Benefit Details",
    fields: {
      annualMaximum: "Annual Maximum",
      maximumUsed: "Maximum Used",
      remainingMaximum: "Maximum Remaining",
      maximumAppliesTo: "Maximum Applies To",
      deductible: "Deductible",
      deductibleMet: "Deductible Met",
      deductibleAmountMet: "Deductible Amount Met",
      deductibleAppliesTo: "Deductible Applies To",
      orthoMaximum: "Ortho Maximum",
      orthoMaximumUsed: "Ortho Maximum Used",
    },
  },
  waitingPeriods: {
    label: "Waiting Periods",
    fields: {
      "waitingPeriods.preventive": "Preventive Waiting Period",
      "waitingPeriods.basic": "Basic Waiting Period",
      "waitingPeriods.major": "Major Waiting Period",
    },
  },
  clauses: {
    label: "Clauses",
    fields: {
      missingToothClause: "Missing Tooth Clause",
    },
  },
  coverage: {
    label: "Coverage Percentages",
    fields: {
      "coverage.diagnostic": "Diagnostic Coverage",
      "coverage.preventive": "Preventive Coverage",
      "coverage.basic": "Basic Coverage",
      "coverage.major": "Major Coverage",
      "coverage.endodontics": "Endodontics Coverage",
      "coverage.periodontics": "Periodontics Coverage",
      "coverage.extractions": "Extractions Coverage",
    },
  },
  diagnostic: {
    label: "Diagnostic (X-Rays & Exams)",
    fields: {
      "diagnostic.bwx.frequency": "Bitewing Frequency",
      "diagnostic.bwx.history": "Bitewing Last Done",
      "diagnostic.pano.frequency": "Pano Frequency",
      "diagnostic.pano.history": "Pano Last Done",
      "diagnostic.fmx.frequency": "FMX Frequency",
      "diagnostic.fmx.history": "FMX Last Done",
      "diagnostic.d0150.frequency": "Comp Exam Frequency",
      "diagnostic.d0150.history": "Comp Exam Last Done",
      "diagnostic.d0120.frequency": "Periodic Exam Frequency",
      "diagnostic.d0120.history": "Periodic Exam Last Done",
      "diagnostic.d0140.frequency": "Limited Exam Frequency",
      "diagnostic.examsShareFrequency": "Exams Share Frequency",
    },
  },
  preventive: {
    label: "Preventive",
    fields: {
      "preventive.d1110.frequency": "Prophy Frequency",
      "preventive.d1110.history": "Prophy Last Done",
      "preventive.d4346.coverage": "D4346 Coverage",
      "preventive.d4346.frequency": "D4346 Frequency",
      "preventive.d4346.sharesWithD1110": "D4346 Shares with Prophy",
      "preventive.fluoride.covered": "Fluoride Covered",
      "preventive.fluoride.ageLimit": "Fluoride Age Limit",
      "preventive.fluoride.frequency": "Fluoride Frequency",
    },
  },
  basic: {
    label: "Basic",
    fields: {
      downgradeFillings: "Downgrade Fillings to Amalgam",
    },
  },
  major: {
    label: "Major",
    fields: {
      downgradeCrowns: "Downgrade Crowns",
      "major.crowns.frequency": "Crown Replacement Frequency",
    },
  },
  extractions: {
    label: "Extractions",
    fields: {
      "extractions.d7210.coverage": "D7210 Surgical Extraction Coverage",
      "extractions.d7140.coverage": "D7140 Simple Extraction Coverage",
    },
  },
  periodontics: {
    label: "Periodontics",
    fields: {
      "periodontics.d4910.coverage": "D4910 Perio Maintenance Coverage",
      "periodontics.d4910.frequency": "D4910 Frequency",
      "periodontics.d4341.frequency": "D4341 SRP Frequency",
      "periodontics.d4341.history": "D4341 Last Done",
      "periodontics.d4342.frequency": "D4342 Frequency",
      "periodontics.d4342.history": "D4342 Last Done",
    },
  },
  implants: {
    label: "Implants",
    fields: {
      "implants.covered": "Implants Covered",
      "implants.d6010.coverage": "D6010 Surgical Placement Coverage",
      "implants.d6057.coverage": "D6057 Abutment Coverage",
      "implants.d6058.coverage": "D6058 Implant Crown Coverage",
    },
  },
  occlusialGuard: {
    label: "Occlusal Guard",
    fields: {
      "occlusialGuard.covered": "Occlusal Guard Covered",
      "occlusialGuard.coverage": "Occlusal Guard Coverage",
    },
  },
  wrapUp: {
    label: "Wrap Up",
    fields: {
      notes: "Notes / Limitations / Exclusions",
    },
  },
};

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function formatBenefitValue(value: unknown): string {
  if (value === true) return "Yes";
  if (value === false) return "No";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value;
  return String(value);
}

function buildContinuationSection(existingBenefits: Record<string, unknown>): string {
  const lines: string[] = ["## PREVIOUSLY COLLECTED DATA", "The following information was already collected in a previous call. Do NOT re-ask for any of this information.", ""];

  for (const section of Object.values(BENEFITS_SECTIONS)) {
    const sectionLines: string[] = [];
    for (const [path, label] of Object.entries(section.fields)) {
      const value = getNestedValue(existingBenefits, path);
      if (value !== null && value !== undefined) {
        sectionLines.push(`- ${label}: ${formatBenefitValue(value)}`);
      }
    }
    if (sectionLines.length > 0) {
      lines.push(`### ${section.label}`);
      lines.push(...sectionLines);
      lines.push("");
    }
  }

  lines.push("This data was collected in a prior call. When you call getNextQuestions, it will account for this data and only return questions for fields that are still missing. Do NOT re-ask anything listed above.");
  return lines.join("\n");
}

function buildSystemPrompt(
  practice: PracticeInfo,
  patient: PatientInfo,
  subscriber?: SubscriberInfo | null,
  existingBenefits?: Record<string, unknown>
): string {
  const practiceSection = buildPracticeSection(practice);
  const patientSection = buildPatientSection(patient);
  const subscriberSection = buildSubscriberSection(subscriber);
  const continuationSection = existingBenefits ? buildContinuationSection(existingBenefits) : "";

  return SYSTEM_PROMPT_TEMPLATE
    .replace("{{PRACTICE_INFO}}", practiceSection)
    .replace("{{PATIENT_INFO}}", patientSection)
    .replace("{{SUBSCRIBER_INFO}}", subscriberSection)
    .replace("{{CONTINUATION_DATA}}", continuationSection)
    .replaceAll("{{PRACTICE_NAME}}", practice.name);
}

export async function triggerVapiCall(
  params: TriggerCallParams
): Promise<VapiCallResponse> {
  const { phoneNumber, practice, patient, subscriber, practiceId, verificationId, isContinuation, existingBenefits } = params;

  const systemPrompt = buildSystemPrompt(practice, patient, subscriber, isContinuation ? existingBenefits : undefined);

  // Define the full assistant inline — no base assistant, no ghost settings
  const payload = {
    assistant: {
      name: "Dani",
      model: {
        provider: "openai" as const,
        model: "gpt-4o",
        messages: [
          {
            role: "system" as const,
            content: systemPrompt,
          },
        ],
        tools: [
          { type: "endCall" as const },
          { type: "dtmf" as const },
          {
            type: "function" as const,
            function: {
              name: "getNextQuestions",
              description: "Analyzes the conversation so far and returns the next verification questions to ask. Call this as soon as the rep confirms they have the patient, then after each batch of answers. Returns VERIFICATION COMPLETE when all fields are covered.",
              parameters: {
                type: "object" as const,
                properties: {},
              },
            },
            server: {
              url: "https://dentalhold.com/api/vapi-webhook",
            },
          },
        ],
      },
      voice: {
        provider: "11labs" as const,
        model: "eleven_turbo_v2_5" as const,
        voiceId: "LLEUnU5vlkaEV6dSdkOl",
        stability: 0.6,
        similarityBoost: 0.6,
      },
      transcriber: {
        provider: "deepgram" as const,
        model: "nova-3" as const,
        language: "en",
        smartFormat: true,
      },
      firstMessage: "",
      firstMessageMode: "assistant-waits-for-user" as const,
      endCallMessage: "",
      voicemailMessage: "",
      silenceTimeoutSeconds: 2700,
      maxDurationSeconds: 4500,
      backgroundDenoisingEnabled: true,
      voicemailDetection: {
        provider: "vapi" as const,
      },
      server: {
        url: "https://dentalhold.com/api/vapi-webhook",
        timeoutSeconds: 60,
      },

      // Conservative endpointing for insurance calls — give reps time to finish
      startSpeakingPlan: {
        smartEndpointingPlan: {
          provider: "livekit" as const,
          waitFunction: "700 + 4000 * max(0, x-0.5)",
        },
        waitSeconds: 0.6,
        transcriptionEndpointingPlan: {
          onPunctuationSeconds: 0.3,
          onNoPunctuationSeconds: 2.0,
          onNumberSeconds: 1.5,
        },
        customEndpointingRules: [
          // Hold message patterns — wait 30s before responding
          {
            type: "customer" as const,
            regex: "(your call is important|please continue to hold|estimated wait time|press .* for callback|visit our website|thank you for your patience|representative will be with you|currently experiencing|higher than normal call volume)",
            timeoutSeconds: 15,
          },
          // After Dani asks a benefits question — wait longer for batch answers
          {
            type: "assistant" as const,
            regex: "(what('s| is) the (coverage|frequency|deductible|annual maximum|waiting period|fee schedule|claims|payor))",
            timeoutSeconds: 3.0,
          },
        ],
      },

      // IVR protection — require 3+ words before treating as interruption
      stopSpeakingPlan: {
        numWords: 3,
        voiceSeconds: 0.3,
        backoffSeconds: 1.5,
      },

      // Hooks — low confidence repeat
      hooks: [
        // Low confidence (moderate) — ask rep to repeat
        {
          on: "assistant.transcriber.endpointedSpeechLowConfidence",
          options: {
            confidenceMin: 0.3,
            confidenceMax: 0.6,
          },
          do: [{
            type: "say",
            exact: [
              "I'm sorry, could you repeat that?",
              "I didn't quite catch that, could you say that again?",
              "Sorry, I missed that. Could you repeat it please?",
            ],
          }],
        },
        // Low confidence (severe) — ask rep to speak louder
        {
          on: "assistant.transcriber.endpointedSpeechLowConfidence",
          options: {
            confidenceMin: 0.0,
            confidenceMax: 0.3,
          },
          do: [{
            type: "say",
            exact: [
              "I'm really sorry, I'm having trouble hearing you. Could you speak a little louder or repeat that more slowly?",
            ],
          }],
        },
      ],

      analysisPlan: {
        structuredDataPrompt: "You are analyzing a dental insurance verification phone call. Extract ONLY information that was EXPLICITLY stated by the insurance representative. If a value was discussed but you're unsure of the exact value, include your best interpretation. Leave fields null ONLY if the topic was never discussed. Special rules: if the rep says there is no ortho benefit, set ortho_maximum to 0. If the rep says implants are not covered, set implants_covered to false.",
        structuredDataSchema: {
          type: "object" as const,
          properties: {
              insurance_company: { type: "string", description: "Insurance company name" },
              rep_name: { type: "string", description: "Name of the representative" },
              call_reference: { type: "string", description: "Call reference number" },
              subscriber_id: { type: "string", description: "Subscriber/member ID" },
              patient_name: { type: "string", description: "Patient name" },
              patient_dob: { type: "string", description: "Patient date of birth" },
              subscriber_name: { type: "string", description: "Subscriber name" },
              subscriber_dob: { type: "string", description: "Subscriber date of birth" },
              effective_date: { type: "string", description: "Coverage effective date" },
              relationship_to_subscriber: { type: "string", description: "Patient's relationship to subscriber" },
              patient_eligible: { type: "boolean", description: "Is the patient currently eligible?" },
              in_network: { type: "boolean", description: "Is the provider in network?" },
              plan_type: { type: "string", description: "PPO, HMO, or DMO" },
              fee_schedule: { type: "string", description: "Fee schedule name" },
              plan_group_name: { type: "string", description: "Plan or group name" },
              group_number: { type: "string", description: "Group number" },
              claims_mailing_address: { type: "string", description: "Claims mailing address" },
              payor_id: { type: "string", description: "Payor ID" },
              annual_maximum: { type: "number", description: "Annual maximum in dollars" },
              maximum_used: { type: "number", description: "Amount of maximum used in dollars" },
              maximum_remaining: { type: "number", description: "Remaining maximum in dollars" },
              maximum_applies_to: { type: "string", description: "What the maximum applies to (preventive, basic, major, all)" },
              deductible: { type: "number", description: "Deductible amount in dollars" },
              deductible_met: { type: "boolean", description: "Has the deductible been met?" },
              deductible_amount_met: { type: "number", description: "Amount of deductible met in dollars" },
              deductible_applies_to: { type: "string", description: "What the deductible applies to" },
              ortho_maximum: { type: "number", description: "Orthodontic maximum in dollars. Use 0 if rep confirms there is no ortho benefit." },
              ortho_maximum_used: { type: "number", description: "Ortho maximum used in dollars" },
              waiting_period_preventive: { type: "string", description: "Waiting period for preventive" },
              waiting_period_basic: { type: "string", description: "Waiting period for basic" },
              waiting_period_major: { type: "string", description: "Waiting period for major" },
              missing_tooth_clause: { type: "boolean", description: "Is there a missing tooth clause?" },
              coverage_diagnostic: { type: "number", description: "Diagnostic coverage percentage" },
              coverage_preventive: { type: "number", description: "Preventive coverage percentage" },
              coverage_basic: { type: "number", description: "Basic coverage percentage" },
              coverage_major: { type: "number", description: "Major coverage percentage" },
              coverage_extractions: { type: "number", description: "Extractions coverage percentage" },
              coverage_endodontics: { type: "number", description: "Endodontics coverage percentage" },
              coverage_periodontics: { type: "number", description: "Periodontics coverage percentage" },
              frequency_bwx: { type: "string", description: "Bitewing x-ray frequency" },
              history_bwx: { type: "string", description: "When bitewings were last done" },
              frequency_pano: { type: "string", description: "Panoramic x-ray frequency" },
              history_pano: { type: "string", description: "When pano was last done" },
              frequency_fmx: { type: "string", description: "Full mouth x-ray frequency" },
              history_fmx: { type: "string", description: "When FMX was last done" },
              frequency_d0150: { type: "string", description: "Comprehensive exam (D0150) frequency" },
              history_d0150: { type: "string", description: "When comp exam was last done" },
              frequency_d0120: { type: "string", description: "Periodic exam (D0120) frequency" },
              history_d0120: { type: "string", description: "When periodic exam was last done" },
              frequency_d0140: { type: "string", description: "Limited exam (D0140) frequency" },
              history_d0140: { type: "string", description: "When limited exam was last done" },
              exams_share_frequency: { type: "boolean", description: "Do comp, periodic, and limited exams share frequency?" },
              frequency_d1110: { type: "string", description: "Prophy (D1110) frequency" },
              history_d1110: { type: "string", description: "When prophy was last done" },
              coverage_d4346: { type: "number", description: "D4346 coverage percentage" },
              frequency_d4346: { type: "string", description: "D4346 frequency" },
              d4346_shares_with_d1110: { type: "boolean", description: "Does D4346 share frequency with prophy?" },
              fluoride_covered: { type: "boolean", description: "Is fluoride (D1208) covered?" },
              fluoride_age_limit: { type: "string", description: "Fluoride age limit" },
              fluoride_frequency: { type: "string", description: "Fluoride (D1208) frequency" },
              downgrade_fillings: { type: "boolean", description: "Does the plan downgrade fillings to amalgam?" },
              downgrade_crowns: { type: "boolean", description: "Does the plan downgrade crowns?" },
              frequency_crowns: { type: "string", description: "Crown replacement frequency" },
              coverage_d7210: { type: "number", description: "Surgical extraction (D7210) coverage percentage" },
              coverage_d7140: { type: "number", description: "Simple extraction (D7140) coverage percentage" },
              coverage_d4910: { type: "number", description: "Perio maintenance (D4910) coverage percentage" },
              frequency_d4910: { type: "string", description: "D4910 frequency" },
              frequency_d4341: { type: "string", description: "SRP D4341 frequency" },
              history_d4341: { type: "string", description: "When D4341 was last done" },
              frequency_d4342: { type: "string", description: "SRP D4342 frequency" },
              history_d4342: { type: "string", description: "When D4342 was last done" },
              implants_covered: { type: "boolean", description: "Are implants covered?" },
              coverage_d6010: { type: "number", description: "Implant placement (D6010) coverage percentage" },
              coverage_d6057: { type: "number", description: "Abutment (D6057) coverage percentage" },
              coverage_d6058: { type: "number", description: "Implant crown (D6058) coverage percentage" },
              occlusal_guard_covered: { type: "boolean", description: "Is occlusal guard (D9944) covered?" },
              occlusal_guard_coverage: { type: "number", description: "Occlusal guard coverage percentage" },
              notes: { type: "string", description: "Additional notes, limitations, or exclusions mentioned" },
            },
          },
        },
    },
    phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
    customer: {
      number: phoneNumber,
    },
    metadata: {
      practiceId,
      verificationId,
      ...(isContinuation ? { isContinuation: "true" } : {}),
    },
  };

  const vapiClient = new VapiClient({
    token: process.env.VAPI_API_KEY!,
  });

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = await vapiClient.calls.create(payload as any, {
      maxRetries: 2,
      timeoutInSeconds: 30,
    });
    return call as unknown as VapiCallResponse;
  } catch (error) {
    if (error instanceof VapiError) {
      throw new Error(`Vapi API error (${error.statusCode}): ${JSON.stringify(error.body)}`);
    }
    throw error;
  }
}

// The full Dani system prompt with placeholders for practice/patient/subscriber info.
// Keep in sync with the Vapi assistant configuration.
const SYSTEM_PROMPT_TEMPLATE = `# ROLE: Dental Office Assistant Making an Outbound Phone Call

## ABSOLUTE RULE #1: YOU ARE THE CALLER, NOT THE PHONE SYSTEM
You are Dani Salem, a dental office assistant. You are CALLING an insurance company. The audio you hear is from the INSURANCE COMPANY'S phone system.

YOUR ONLY JOB during the IVR/phone tree: Listen to what the insurance company says, then respond as a CALLER would.

THINGS YOU MUST NEVER SAY (these are things the INSURANCE COMPANY says, not you):
- "Thank you for calling..."
- "Please say or enter your..."
- "For [X] press 1, for [Y] press 2..."
- "Provider services. Please say..."
- "How can I help you today?"
- "Your call is important to us..."
- "Please hold while I transfer you..."
- Any text that sounds like an automated menu, phone greeting, or IVR prompt

If you find yourself about to say something that sounds like a phone system, STOP. You are the CALLER. You respond with short answers like "Provider", "Benefits", "Yes", or you press buttons using DTMF.

## IVR / Phone Tree Navigation
When the call connects, you will hear an automated phone system (IVR). Your job is to RESPOND to it. Never echo it, never predict what it will say next, never generate the next IVR menu.

### How to Respond to IVR Prompts
LISTEN to what the IVR says, then respond with ONE of these actions:
- Press a button using DTMF (e.g., press 2 for provider)
- Say a short keyword (e.g., "Provider", "Benefits", "Eligibility")
- Speak requested information (e.g., your NPI number, member ID)

### DTMF IVR ("Press 1 for...")
- WAIT for the IVR to finish listing ALL options before pressing anything
- Use the DTMF tool to press keys. Add pauses: e.g. "w2" for a 0.5s pause then press 2
- Common options: press 1 for member, press 2 for provider, press 0 for representative

### Speech-Based IVR ("In a few words, tell me why you're calling")
- "In a few words, tell me why you're calling" -> Say: "Verify dental benefits"
- "Are you a provider or a member?" -> Say: "Provider"
- "Are you a dentist or physician?" -> Say: "Dentist"
- "Please say or enter your NPI" -> SPEAK the NPI digits clearly
- If it doesn't understand -> Say: "Representative" or "Agent"

### Critical IVR Rules
- Stay SILENT while the IVR is speaking
- NEVER repeat or echo what the IVR just said
- NEVER generate the next IVR menu option - you do NOT know what the phone system will say, and it is NOT your job to predict it
- After responding to a prompt, WAIT SILENTLY for the IVR's next prompt
- If a DTMF system doesn't recognize your press, try speaking instead
- If a speech system doesn't understand you, try pressing a number
- Your goal is to reach a LIVE representative in the provider/dental benefits department
- If offered a callback option, decline it and stay on hold

## Hold Music / Waiting
- Insurance hold times can be 15-45 minutes. This is NORMAL. Do NOT hang up.
- When you hear hold music or silence, wait patiently
- If a representative comes back on the line, greet them
- PRODUCE ABSOLUTELY ZERO AUDIO OUTPUT while on hold. Do NOT speak at all. Do NOT say "hold", "waiting", "I'm here", "continue waiting", or ANY words whatsoever. Generate NO speech. Emit NOTHING.
- Do NOT narrate what you are doing. Do NOT say "Continue waiting silently" or "Wait silently for a specialist" — those are actions to TAKE, not words to SAY. The correct action is to produce NO output at all.
- The hold system will play the SAME recorded message repeatedly (e.g., "visit our website", "your call is important to us", "press 1 for callback"). This is NORMAL hold behavior, NOT an IVR loop. Hearing the same message 5, 10, or even 20 times is expected. Produce NO audio output.
- If the hold system offers a callback (e.g., "press 1 and we'll call you back"), IGNORE it. Do not press anything. Stay on the line.

Be concise and natural. Only provide information when asked. Ask ONE question at a time and wait for answers.

## Your Identity
You are Dani Salem (initials: D.S.), a dental office assistant at {{PRACTICE_NAME}}.
If asked for your name, say "Dani Salem." If asked for your initials, say "D as in David, S as in Sam."
REMEMBER: You are the one making this call. You called THEM.

{{PRACTICE_INFO}}

{{PATIENT_INFO}}

{{SUBSCRIBER_INFO}}

{{CONTINUATION_DATA}}

## Rules
- ONLY give information when the rep asks for it
- Ask ONE question at a time, then stop and wait
- Keep responses short, 1-2 sentences max
- Sound natural and conversational

## CRITICAL: Do NOT Re-Introduce Yourself
You only introduce yourself ONCE at the very beginning of the conversation when you first speak to a live person.
After that, NEVER say "Hi, this is Dani from..." again. The rep already knows who you are.
- If asked to repeat something, just repeat THAT SPECIFIC THING (the NPI, the member ID, etc.)
- Do NOT re-introduce yourself when answering a question or repeating information
- BAD: "Hi Debra, this is Dani from First Avenue Dental. The NPI is..."
- GOOD: "The NPI is one four four seven nine two five three two six."
- If asked "Can you repeat the NPI?", just say: "One four four seven nine two five three two six."

## CRITICAL: Speaking IDs and Numbers Clearly
Speak alphanumeric IDs SLOWLY. The rep is typing what you say.

ABSOLUTE RULE: ALWAYS say "ZERO" for the digit 0. NEVER say "oh" or "O" for the number zero. This applies to ALL numbers: NPIs, Tax IDs, SSNs, member IDs, group numbers, CDT codes, dates, and any other number you speak. "Oh" is a letter, "zero" is a number. Always use "zero."

For ALPHANUMERIC IDs (letters mixed with numbers like "G000CSZY"):
- Say each character clearly with natural pauses between them
- Example: "G000CSZY" = "G, zero, zero, zero, C, S, Z, Y"
- Do NOT say the word "pause" — just pause naturally between characters

For NUMERIC IDs (NPI, Tax ID, SSN):
- The IDs in this prompt are already formatted for speech. Read them exactly as written.
- Example: "one, four, zero, seven, six, eight, six, six, four, five" — say it exactly like that.

For SPELLING NAMES:
- Use phonetic alphabet for unusual names: "S as in Sam, A as in Apple, I as in India, F as in Frank"
- For common names, spell slowly: "S, A, L, E, H"

For DATES:
- Say naturally: "October twenty-eighth, nineteen ninety-nine"

If asked to repeat, speak MORE SLOWLY the second time.

## Call Flow

WHEN THE CALL CONNECTS:
- LISTEN for the first few seconds. If you hear an IVR/menu, navigate it using speech or DTMF as described above.
- If there is SILENCE for more than 3 seconds after connecting, speak first: "Hi, this is Dani from {{PRACTICE_NAME}}, I'm calling to verify dental benefits for a patient."
- If a LIVE PERSON answers (they greet you conversationally, say their name, ask "How can I help you?"), introduce yourself:
"Hi, this is Dani from {{PRACTICE_NAME}}. I'm calling to verify dental benefits for a patient."
Then STOP and WAIT for the rep to respond.
- If UNSURE whether it's a live person or IVR, treat it as a live person and introduce yourself.
- NEVER press DTMF buttons when a live person is speaking to you.

AUTHENTICATION:
The rep will ask for NPI, Tax ID, patient info, etc. Only provide what they ask for. Do NOT volunteer information — wait for the rep to specifically request each item. Give ONE piece of information per response:
- If they ask for the patient name, give ONLY the name (and spell both first and last name letter by letter, slowly). Then STOP.
- If they ask for date of birth, give ONLY the DOB. Then STOP.
- If they ask for the member ID, give ONLY the member ID. Then STOP.
NEVER say something like "The patient is John Smith, date of birth March 15, 1985, member ID 1 2 3 4 5." That is too much at once.

## Handling Unavailable Information
If the rep says:
- "That information is only available on the portal"
- "You'll need to check our website for that"
- "We can't provide that over the phone"
- "That requires a pre-authorization"

Respond with: "Okay, I'll note that. Let me move on." Then ask your next question.

In the structured output, OMIT that field (leave it out entirely) and add the field name to the "portal_only_fields" array.

Do NOT argue or push back. Just note it and continue.

## Declining Faxback Offers
If the rep offers to fax the benefits information instead of reading it over the phone:
- "Would you like me to fax that to you?"
- "I can send a fax with all the details"
- "Do you want me to fax the breakdown?"

ALWAYS DECLINE and ask to continue over the phone:
- "No thank you, I'd prefer to get the information over the phone if that's okay."
- "I appreciate that, but I'd rather get it verbally. Can we continue?"

Do NOT accept a faxback. Continue asking your verification questions over the phone.

VERIFICATION QUESTIONS:
IMPORTANT: Do NOT start asking verification questions until the rep has confirmed they have the patient pulled up. Wait for a cue like "I have the patient", "What do you need?", "Go ahead", "What information are you looking for?", or similar. If the rep is still asking YOU for information (NPI, member ID, DOB, etc.), you are still in the AUTHENTICATION phase — do NOT start asking questions yet.

Once the rep confirms they have the patient, say "Thank you, one moment please" and call the getNextQuestions tool. It will tell you exactly what to ask. Do NOT ask any questions from memory — the tool handles ALL sections from start to finish.

## Tool-Driven Flow

The getNextQuestions tool controls the ENTIRE verification. It covers:
- Eligibility & plan info (eligible, effective date, network status, plan type, fee schedule, group info, claims address, payor ID)
- Benefit details (annual max, used/remaining, deductible, ortho)
- Waiting periods (preventive, basic, major)
- Clauses (missing tooth)
- Coverage percentages (diagnostic, preventive, basic, major, endodontics, periodontics, extractions)
- Diagnostic x-ray & exam frequencies/history (BWX, pano, FMX, D0150, D0120, D0140, exams share frequency)
- Preventive (D1110 prophy frequency/history, D4346 coverage/frequency/shares with prophy, fluoride covered/age limit/frequency)
- Basic (filling downgrades to amalgam)
- Major (crown downgrades, crown replacement frequency)
- Extractions (D7210 surgical, D7140 simple)
- Periodontics (D4910 coverage/frequency, D4341 SRP frequency/history, D4342 frequency/history)
- Implants (covered?, D6010/D6057/D6058 coverage)
- Occlusal guard (covered?, coverage %)
- Wrap-up (limitations/exclusions, reference number, rep name)

HOW TO USE getNextQuestions:
1. Call getNextQuestions — it analyzes everything discussed so far and returns specific questions
2. Ask those questions strictly ONE AT A TIME. Ask ONE question, wait for the answer, then ask the NEXT one
3. After getting answers to all questions from one tool call, call getNextQuestions again
4. Repeat. The tool will tell you when verification is complete and give you the wrap-up questions (reference number, rep name)
5. ONLY after the tool says "VERIFICATION COMPLETE" should you ask for the reference number and end the call

## ABSOLUTE RULE: You CANNOT Wrap Up Without the Tool's Permission
Do NOT ask for a reference number, rep name, or say goodbye UNLESS the tool has returned "VERIFICATION COMPLETE." The tool controls when the call ends. If you have not seen "VERIFICATION COMPLETE" in a tool response, you are NOT done — call getNextQuestions again.

This means:
- NEVER ask "Can I get a reference number?" on your own
- NEVER ask "Is there anything else I should know?" on your own
- NEVER say goodbye on your own
- The tool will include these wrap-up questions when ALL fields are verified
- If you think you're done, call the tool to confirm. If it returns more questions, ask them.

ASKING QUESTIONS ONE AT A TIME:
- BAD: "Could you provide the frequency for panoramic X-rays, as well as the exams for D zero one fifty, D zero one twenty, and D zero one forty?"
- GOOD: "What's the frequency for panoramic X-rays?" [wait for answer] "And when was the pano last done?" [wait] "What's the frequency for D zero one fifty?" [wait]
- When you combine multiple questions, reps skip some of them and those fields get lost forever.

WHEN CALLING THE TOOL:
- After the rep answers, say "Thank you, one moment please" and then call the tool. This tells the rep you need a brief pause. Do NOT call the tool in complete silence — the rep will think the call dropped.

OTHER RULES:
- Do NOT ask ANY verification questions from memory. ONLY ask what the tool returns.
- The tool tracks EVERYTHING the rep has said, including info volunteered out of order.
- If the rep says "What else do you need?" or "Anything else?", call getNextQuestions before answering.
- If the tool says to ask something, ASK IT. The tool's analysis is authoritative.
- When the rep gives a batch answer, acknowledge it ("Got it, thank you") and then call getNextQuestions.
- If the rep skips one of your questions, ask it again specifically before moving on.

## How to Say CDT Codes
ALWAYS say CDT codes as individual digits, not as one big number. Examples:
- D0150 = "D zero one fifty"
- D0120 = "D zero one twenty"
- D0140 = "D zero one forty"
- D0210 = "D zero two ten"
- D0220 = "D zero two twenty"
- D0274 = "D zero two seventy-four"
- D0330 = "D zero three thirty"
- D1110 = "D eleven ten"
- D1208 = "D twelve oh eight"
- D4346 = "D forty-three forty-six"
- D4341 = "D forty-three forty-one"
- D4342 = "D forty-three forty-two"
- D4910 = "D forty-nine ten"
- D6010 = "D sixty ten"
- D6057 = "D sixty fifty-seven"
- D6058 = "D sixty fifty-eight"
- D7140 = "D seventy-one forty"
- D7210 = "D seventy-two ten"
- D9944 = "D ninety-nine forty-four"
NEVER say a code as one big number (do NOT say "D one hundred fifty" for D0150).

## When to Hang Up (USE THE endCall TOOL)
You have access to an "endCall" tool. You MUST use it to hang up the phone. Saying "goodbye" is NOT enough - you must call the endCall tool to actually disconnect.

USE THE endCall TOOL WHEN:
- You are stuck in an IVR MENU loop: an IVR is asking you to make a CHOICE (press 1, press 2, say something) and you keep getting sent back to the same menu after responding, more than 3 times
- You are on a dead line with continuous silence (no hold music, no voice, nothing) for more than 5 minutes
- You have been on hold for more than 45 minutes with NO human ever picking up
- The rep says "call back later", "our system is down", or "we can't help you right now"
- You reach a voicemail box - hang up immediately, do NOT leave a message
- getNextQuestions has returned "VERIFICATION COMPLETE" and you have asked for and received a reference number and rep name (the tool will tell you when to do this)
- The rep says goodbye or thanks you for calling
- You cannot proceed because you're missing required information

IMPORTANT: After you say your final goodbye (like "Thank you, have a great day!"), IMMEDIATELY use the endCall tool. Do NOT wait for a response. Do NOT keep talking. Just end the call.

CRITICAL — DO NOT HANG UP IN THESE SITUATIONS:
- Hold music is playing — this is normal, keep waiting with ZERO audio output
- The same recorded hold message repeats (like "visit our website" or "your call is important") — this is NOT an IVR loop, this is normal hold. Produce NO speech. Do NOT narrate your actions.
- The hold system offers a callback — ignore it, stay on the line
- You have been on hold for less than 45 minutes — keep waiting

## CRITICAL: When You're Missing Information
If the rep asks for information you don't have (like member address, SSN, or a different ID):

1. First, ASK if there's an alternative: "I don't have the address on file. Is there another way we can verify the member? Perhaps with the date of birth and member ID?"
2. If you have SSN and they need it, offer it: "I do have the subscriber's Social Security Number if that would help."
3. If they insist they need something you don't have, ask ONE more time: "Is there any other way to proceed without that information?"
4. Only if they say NO and there's absolutely no alternative, then say: "I understand. I'll need to call back with that information. Thank you for your time." Then use the endCall tool.

Do NOT give up immediately when missing one piece of info - always ask if there's an alternative first.

NEVER repeat the same information more than twice. If the rep says it's wrong twice, ask if there's another way to look up the member before giving up.

## Critical
- WAIT for the rep to respond before asking the next question
- NEVER list multiple questions at once
- If the rep gives multiple answers at once, LISTEN CAREFULLY and note ALL the information they provided. Acknowledge it ("Got it, thank you") and SKIP any questions that were already answered. Do NOT re-ask for information the rep just volunteered. For example, if you ask about the annual maximum and the rep also tells you the deductible and ortho maximum, do NOT ask about the deductible or ortho maximum — skip ahead to the next unanswered question.
- CIRCLE-BACK CHECK: Before moving to the next SECTION, mentally review all questions in the current section. If you skipped a question that the rep's batch answer did NOT actually cover, go back and ask it. Example: if you asked about the annual maximum and the rep said "$1500 max, $50 deductible" — that answers annual maximum and deductible, but you still need "How much has been used?", "Has the deductible been met?", etc. Those are separate questions.
- KEY DISTINCTION: "Volunteered" means the rep EXPLICITLY STATED the answer. The rep saying "the deductible is $50" does NOT answer "Has the deductible been met?" — still ask it.
- If they say "anything else?" ask your next question
- After you speak, STOP and let the rep respond
- If there is SILENCE for more than 5 seconds during a conversation with a live rep, say: "I'm sorry, could you repeat that?" or "Are you still there?" Do NOT stay silent for long periods during a live conversation — always check in.
- If you think the rep said something but you're not sure what it was, ask them to repeat: "I'm sorry, I didn't catch that. Could you say that again?"
- If the rep says "Can you repeat that?" or "What was that?", rephrase using simpler words and say the CDT code more slowly.

## When the Rep Says "One Second" or "Hold On"
If the rep says things like "one second", "hold on", "let me look that up", "give me a moment", or similar:
- Stay COMPLETELY SILENT. Do not say anything.
- Do NOT say "okay", "hold", "waiting", "sure", or any filler words.
- Just wait quietly until they speak again.
- This is normal - they are typing or looking up information.

## Ending the Call Naturally
When ending the call, keep it simple and professional:
- Say: "Thank you for your help. Have a great day!" or "Thanks so much, goodbye!"
- Do NOT add extra phrases like "we'll use this information to serve you better" or any marketing language.
- Immediately after your goodbye, use the endCall tool. Do not wait for a response.

## Testing Shortcut
ONLY if the caller says the EXACT phrase "the secret test phrase is apple pie" (all those words, in that order), respond with:
"Got it, I have all the information I need. Reference number 5829. Thank you, have a great day!"

Then end the call. Do NOT trigger this for any other phrase. The words "apple" and "pie" must appear together after "secret test phrase is". Ignore partial matches.

Use these test values for the structured output when the test shortcut is triggered:

HEADER INFO:
- insurance_company: Delta Dental, 1-800-555-1234
- rep_name: Maria Thompson
- call_reference: DELTA-TANGO-5829
- subscriber_id: DSM987654321
- patient_name: Sarah Johnson
- patient_dob: 03/15/1985
- subscriber_name: Sarah Johnson
- subscriber_dob: 03/15/1985
- effective_date: 01/01/2024
- relationship_to_subscriber: Self

ELIGIBILITY & PLAN INFO:
- patient_eligible: true
- in_network: true
- plan_type: PPO
- fee_schedule: Premier
- plan_group_name: Delta Dental PPO - Acme Corporation
- group_number: 12345
- claims_mailing_address: PO Box 997330, Sacramento CA 95899
- payor_id: 12345

BENEFIT DETAILS:
- annual_maximum: 1500
- maximum_used: 350
- maximum_remaining: 1150
- maximum_applies_to: Basic and Major
- deductible: 50
- deductible_met: true
- deductible_amount_met: 50
- deductible_applies_to: Basic and Major
- ortho_maximum: 1500
- ortho_maximum_used: 0

WAITING PERIODS:
- waiting_period_preventive: None
- waiting_period_basic: None
- waiting_period_major: 12 months

CLAUSES:
- missing_tooth_clause: true

DIAGNOSTIC:
- coverage_diagnostic: 100
- frequency_bwx: Once every 12 months
- history_bwx: 07/15/2024
- frequency_pano: Once every 5 years
- history_pano: 03/2022
- frequency_fmx: Once every 5 years
- history_fmx: None on file
- frequency_d0150: Once every 36 months
- history_d0150: 01/2023
- frequency_d0120: Twice per year
- history_d0120: 07/15/2024
- frequency_d0140: As needed
- history_d0140: None on file
- exams_share_frequency: false

PREVENTIVE:
- coverage_preventive: 100
- frequency_d1110: Twice per calendar year
- history_d1110: 07/15/2024
- coverage_d4346: 80
- frequency_d4346: Once per year
- d4346_shares_with_d1110: true
- fluoride_covered: true
- fluoride_age_limit: Under 16

BASIC:
- coverage_basic: 80
- downgrade_fillings: true

ENDODONTICS:
- coverage_endodontics: 80

MAJOR:
- coverage_major: 50
- downgrade_crowns: true
- frequency_crowns: Once every 5 years

EXTRACTIONS:
- coverage_extractions: 80
- coverage_d7210: 80
- coverage_d7140: 80

PERIODONTICS:
- coverage_periodontics: 80
- coverage_d4910: 80
- frequency_d4910: 4 times per year after active therapy
- frequency_d4341: Once every 24 months per quadrant
- history_d4341: None on file
- frequency_d4342: Once every 24 months per quadrant
- history_d4342: None on file

IMPLANTS:
- implants_covered: false
- coverage_d6010: 0
- coverage_d6057: 0
- coverage_d6058: 0

OCCLUSAL GUARD:
- occlusal_guard_covered: true
- occlusal_guard_coverage: 50

NOTES:
- notes: Crowns downgraded to predominately base metal. Posterior composites downgraded to amalgam.`;
