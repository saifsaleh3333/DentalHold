import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Vapi structured output format
interface VapiStructuredResult {
  plan_type?: string;
  deductible?: number;
  benefit_year?: string;
  annual_maximum?: number;
  deductible_met?: number;
  effective_date?: string;
  patient_eligible?: boolean;
  remaining_maximum?: number;
  preventive_coverage?: number;
  basic_coverage?: number;
  major_coverage?: number;
  prophy_frequency?: string;
  bwx_frequency?: string;
  pano_frequency?: string;
  waiting_periods?: string;
  reference_number?: string;
  rep_name?: string;
  // Patient info (if captured by assistant)
  patient_name?: string;
  patient_dob?: string;
  member_id?: string;
  insurance_carrier?: string;
}

interface VapiToolOutput {
  name: string;
  result: VapiStructuredResult;
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
    };
    // Tool calls results - the structured output format you showed
    toolCalls?: Array<{
      id: string;
      result: VapiStructuredResult;
    }>;
    // Analysis may contain structured data
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

      // Extract structured data - it comes as { "uuid": { name, result } }
      let structuredResult: VapiStructuredResult = {};

      if (analysis?.structuredData) {
        // Get the first (and likely only) tool output
        const toolOutputs = Object.values(analysis.structuredData);
        if (toolOutputs.length > 0 && toolOutputs[0].result) {
          structuredResult = toolOutputs[0].result;
        }
      }

      // Determine status based on call outcome and whether we got data
      let status = "completed";
      if (call?.endedReason && !["customer-ended-call", "assistant-ended-call", "hangup"].includes(call.endedReason)) {
        status = "failed";
      }
      if (!structuredResult.patient_eligible && structuredResult.patient_eligible !== false) {
        // No eligibility data captured
        status = structuredResult.patient_eligible === false ? "completed" : "failed";
      }

      // Calculate duration string
      let callDuration: string | undefined;
      if (call?.duration) {
        const minutes = Math.floor(call.duration / 60);
        const seconds = Math.round(call.duration % 60);
        callDuration = `${minutes} min ${seconds} sec`;
      }

      // Build benefits object matching your UI
      const benefits = {
        eligible: structuredResult.patient_eligible,
        effectiveDate: structuredResult.effective_date,
        planType: structuredResult.plan_type,
        benefitYear: structuredResult.benefit_year,
        annualMaximum: structuredResult.annual_maximum,
        remainingMaximum: structuredResult.remaining_maximum,
        deductible: structuredResult.deductible,
        deductibleMet: structuredResult.deductible_met,
        coverage: {
          preventive: structuredResult.preventive_coverage,
          basic: structuredResult.basic_coverage,
          major: structuredResult.major_coverage,
        },
        frequencies: {
          prophy: structuredResult.prophy_frequency,
          bwx: structuredResult.bwx_frequency,
          pano: structuredResult.pano_frequency,
        },
        waitingPeriods: structuredResult.waiting_periods,
      };

      // Create verification record
      const verification = await prisma.verification.create({
        data: {
          status,
          patientName: structuredResult.patient_name || "Unknown Patient",
          patientDOB: structuredResult.patient_dob || "",
          memberId: structuredResult.member_id || "",
          insuranceCarrier: structuredResult.insurance_carrier || "",
          callDuration,
          recordingUrl: artifact?.recordingUrl || artifact?.stereoRecordingUrl || call?.recordingUrl,
          transcript: artifact?.transcript || call?.transcript,
          benefits: JSON.stringify(benefits),
          referenceNumber: structuredResult.reference_number,
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
