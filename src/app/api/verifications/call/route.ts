import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { triggerVapiCall, normalizePhoneNumber, formatDateForSpeech } from "@/lib/vapi";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.practiceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    const { patientName, patientDOB, memberId, insuranceCarrier, phoneNumber } = body;
    if (!patientName || !patientDOB || !memberId || !insuranceCarrier || !phoneNumber) {
      return NextResponse.json(
        { error: "Missing required fields: patientName, patientDOB, memberId, insuranceCarrier, phoneNumber" },
        { status: 400 }
      );
    }

    // Normalize phone number to E.164
    let e164Phone: string;
    try {
      e164Phone = normalizePhoneNumber(phoneNumber);
    } catch {
      return NextResponse.json(
        { error: "Invalid phone number. Please enter a 10-digit US phone number." },
        { status: 400 }
      );
    }

    // Fetch practice info
    const practice = await prisma.practice.findUnique({
      where: { id: session.user.practiceId },
    });

    if (!practice) {
      return NextResponse.json({ error: "Practice not found" }, { status: 404 });
    }

    // Format dates for speech
    const spokenPatientDOB = formatDateForSpeech(patientDOB);
    const spokenSubscriberDOB = body.subscriberDOB
      ? formatDateForSpeech(body.subscriberDOB)
      : "";

    // Create verification record
    const verification = await prisma.verification.create({
      data: {
        status: "in_progress",
        patientName,
        patientDOB: spokenPatientDOB,
        memberId,
        insuranceCarrier,
        phoneNumber: e164Phone,
        practiceId: session.user.practiceId,
        createdById: session.user.id,
      },
    });

    // Trigger Vapi call
    try {
      const vapiCall = await triggerVapiCall({
        phoneNumber: e164Phone,
        practice,
        patient: {
          patientName,
          patientDOB: spokenPatientDOB,
          memberId,
        },
        subscriber: body.subscriberName
          ? {
              subscriberName: body.subscriberName,
              subscriberDOB: spokenSubscriberDOB,
            }
          : null,
        practiceId: session.user.practiceId,
        verificationId: verification.id,
      });

      // Update verification with call ID
      await prisma.verification.update({
        where: { id: verification.id },
        data: { callId: vapiCall.id },
      });

      return NextResponse.json({ verificationId: verification.id }, { status: 201 });
    } catch (vapiError) {
      // Mark verification as failed if Vapi call fails
      await prisma.verification.update({
        where: { id: verification.id },
        data: { status: "failed" },
      });

      console.error("Vapi call trigger failed:", vapiError);
      return NextResponse.json(
        { error: "Failed to start verification call. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in call trigger:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
