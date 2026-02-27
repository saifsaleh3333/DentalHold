import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  fluoride_age_limit: "string", downgrade_fillings: "boolean", downgrade_crowns: "boolean",
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
            content: `Extract dental insurance verification data from this phone call transcript. Return a JSON object with ONLY fields that were explicitly stated by the insurance representative. Use null for anything not discussed.\n\nFields:\n${fieldList}\n\nReturn valid JSON only.`,
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
      let status = "completed";
      if (call?.endedReason && !["customer-ended-call", "assistant-ended-call", "hangup"].includes(call.endedReason)) {
        status = "failed";
      }
      if (structuredResult.patient_eligible === undefined && !structuredResult.annual_maximum) {
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
