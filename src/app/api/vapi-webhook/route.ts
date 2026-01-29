import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

      // Extract structured data - check artifact.structuredOutputs first, then analysis.structuredData
      let structuredResult: VapiStructuredResult = {};

      // Primary location: artifact.structuredOutputs
      if (artifact?.structuredOutputs) {
        const toolOutputs = Object.values(artifact.structuredOutputs);
        if (toolOutputs.length > 0 && toolOutputs[0].result) {
          structuredResult = toolOutputs[0].result;
        }
      }
      // Fallback: analysis.structuredData
      else if (analysis?.structuredData) {
        const toolOutputs = Object.values(analysis.structuredData);
        if (toolOutputs.length > 0 && toolOutputs[0].result) {
          structuredResult = toolOutputs[0].result;
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

      // Create verification record
      const verification = await prisma.verification.create({
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
        },
      });

      console.log("Verification created:", verification.id);

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
