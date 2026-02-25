import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { triggerVapiCall } from "@/lib/vapi";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.practiceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Parse optional overrides from request body
    let overrides: { phoneNumber?: string } = {};
    try {
      const body = await request.json();
      if (body.phoneNumber) overrides.phoneNumber = body.phoneNumber;
    } catch {
      // No body or invalid JSON — that's fine, use original data
    }

    // Fetch original verification
    const original = await prisma.verification.findFirst({
      where: { id, practiceId: session.user.practiceId },
    });

    if (!original) {
      return NextResponse.json(
        { error: "Verification not found" },
        { status: 404 }
      );
    }

    const phoneNumber = overrides.phoneNumber || original.phoneNumber;
    if (!phoneNumber) {
      return NextResponse.json(
        { error: "No phone number provided" },
        { status: 400 }
      );
    }

    // Fetch practice info for Vapi call
    const practice = await prisma.practice.findUnique({
      where: { id: session.user.practiceId },
    });

    if (!practice) {
      return NextResponse.json({ error: "Practice not found" }, { status: 404 });
    }

    // Create new verification with same patient/insurance data
    const newVerification = await prisma.verification.create({
      data: {
        status: "in_progress",
        patientName: original.patientName,
        patientDOB: original.patientDOB,
        patientAddress: original.patientAddress,
        memberId: original.memberId,
        groupNumber: original.groupNumber,
        insuranceCarrier: original.insuranceCarrier,
        phoneNumber,
        patientSSN: original.patientSSN,
        practiceId: session.user.practiceId,
        createdById: session.user.id,
      },
    });

    // Trigger Vapi call with same data
    try {
      const vapiCall = await triggerVapiCall({
        phoneNumber,
        practice,
        patient: {
          patientName: original.patientName,
          patientDOB: original.patientDOB,
          patientAddress: original.patientAddress || undefined,
          memberId: original.memberId,
          groupNumber: original.groupNumber || undefined,
          patientSSN: original.patientSSN || undefined,
        },
        subscriber: null,
        practiceId: session.user.practiceId,
        verificationId: newVerification.id,
      });

      await prisma.verification.update({
        where: { id: newVerification.id },
        data: { callId: vapiCall.id },
      });

      return NextResponse.json({ verificationId: newVerification.id }, { status: 201 });
    } catch (vapiError) {
      await prisma.verification.update({
        where: { id: newVerification.id },
        data: { status: "failed" },
      });

      console.error("Vapi call trigger failed on restart:", vapiError);
      return NextResponse.json(
        { error: "Failed to start verification call. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error restarting verification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
